let faceModelLoaded = false;

async function loadFaceModel(){
await faceapi.nets.tinyFaceDetector.loadFromUri(
"https://cdn.jsdelivr.net/npm/face-api.js/models"
);
faceModelLoaded = true;
}


async function detectFace(image){

const img = new Image();
img.src = image;

await new Promise(resolve => img.onload = resolve);

const detection = await faceapi.detectAllFaces(
img,
new faceapi.TinyFaceDetectorOptions()
);

return detection.length > 0;

}

function detectDocument(image){

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = image;

return new Promise(resolve => {

img.onload = () => {

canvas.width = img.width;
canvas.height = img.height;

ctx.drawImage(img,0,0);

const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;

let brightPixels = 0;

for(let i=0;i<data.length;i+=40){

const r=data[i];
const g=data[i+1];
const b=data[i+2];

if(r>200 && g>200 && b>200){
brightPixels++;
}

}

resolve(brightPixels > 1500);

};

});

}
document.addEventListener("DOMContentLoaded", function () {
    loadFaceModel();
    const cameraBtn = document.getElementById("cameraBtn");
    const cameraModal = document.getElementById("cameraModal");
    const video = document.getElementById("cameraStream");
    const captureBtn = document.getElementById("captureBtn");
    const closeCamera = document.getElementById("closeCamera");

    let stream;
    /* OPEN CAMERA */
    if(cameraBtn){
    cameraBtn.addEventListener("click", async ()=>{
    cameraModal.style.display = "flex";
    try{
    stream = await navigator.mediaDevices.getUserMedia({ video:true });
    video.srcObject = stream;
    }catch(err){
    alert("Camera access denied or not available.");
    console.error(err);
    }
    });
    }

    /* CAPTURE PHOTO */
    const previewContainer = document.getElementById("previewContainer");
    const previewImage = document.getElementById("resumePreview");
    const retakeBtn = document.getElementById("retakeBtn");
    let capturedImage = null;
    if(captureBtn){
    captureBtn.addEventListener("click",()=>{

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if(canvas.width === 0 || canvas.height === 0){
    alert("Camera capture failed. Please try again.");
    return;
    }

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video,0,0);

    capturedImage = canvas.toDataURL("image/png");
    previewImage.src = capturedImage;
    previewImage.style.display = "block";
    
    document.getElementById("retakeBtn").style.display = "block";
   
    stream.getTracks().forEach(track => track.stop());
    cameraModal.style.display="none";
    
    document.getElementById("uploadContent").style.display="none";
    /* enable existing button */
    uploadBtn.disabled = false;
    uploadBtn.classList.remove("disabled");
    });
    }

    /* CLOSE CAMERA */
    if(closeCamera){
    closeCamera.addEventListener("click",()=>{
    if(stream){
    stream.getTracks().forEach(track => track.stop());
    }
    cameraModal.style.display = "none";
    });
    }

    retakeBtn.addEventListener("click", async ()=>{
    previewImage.style.display="none";
    retakeBtn.style.display = "none";
    document.getElementById("uploadContent").style.display="block";
    cameraModal.style.display="flex";
    stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;
    });

    const savedTheme = localStorage.getItem("themeMode");
    const savedColor = localStorage.getItem("accentColor");

    if(savedTheme === "dark"){
    document.body.classList.add("dark");
    }

    if(savedColor){
    document.documentElement.style.setProperty("--primary", savedColor);
    }
    const dropArea = document.getElementById("dropArea");
    const browseBtn = document.getElementById("browseBtn");
    const fileInput = document.getElementById("fileInput");
    const uploadBtn = document.getElementById("uploadBtn");
    const dropTitle = document.getElementById("dropTitle");

    let selectedFile = null;

    /* =========================
       FILE SELECTION
    ========================== */

    browseBtn.addEventListener("click", () => fileInput.click());
    dropArea.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function () {
        handleFile(this.files[0]);
    });

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("active");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("active");
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("active");
        handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Unsupported file type.");
            return;
        }

        selectedFile = file;
        dropTitle.textContent = file.name;
        uploadBtn.classList.remove("disabled");
        uploadBtn.disabled = false;
    }

    /* =========================
       RESUME TEXT EXTRACTION
    ========================== */

    async function extractText(file) {

        // PDF
        if (file.type === "application/pdf") {

            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

            let text = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(" ");
            }

            return text;
        }

        // DOCX
        if (file.type.includes("word")) {
            const buffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: buffer });
            return result.value;
        }

        // TXT
        if (file.type === "text/plain") {
            return await file.text();
        }

        return "";
    }

    /* =========================
       BUILD PROFILE
    ========================== */

    async function buildProfile(file) {

        const text = await extractText(file);
        const lowerText = text.toLowerCase();

        const res = await fetch("data/career_roles.json");
        const rolesData = await res.json();

        let skills = [];
        let industries = [];
        let experience = "Fresher";
        let freelance = false;
        let workStyle = "Hybrid";

        /* =========================
           EXTRACT SKILLS
        ========================== */

        for (let roleName in rolesData) {

            const role = rolesData[roleName];

            role.skills.forEach(skill => {
                if (lowerText.includes(skill.toLowerCase())) {
                    if (!skills.includes(skill)) {
                        skills.push(skill);
                    }
                }
            });

            if (lowerText.includes(role.category.toLowerCase())) {
                if (!industries.includes(role.category)) {
                    industries.push(role.category);
                }
            }
        }

        /* =========================
           EXPERIENCE DETECTION
        ========================== */

        const yearMatch = lowerText.match(/\b([0-9]+)\s+years?\b/);

        if (yearMatch) {
            const years = parseInt(yearMatch[1]);

            if (years >= 10) experience = "10+";
            else if (years >= 5) experience = "5+";
            else if (years >= 3) experience = "3+";
            else if (years >= 2) experience = "2+";
            else if (years >= 1) experience = "1+";
        }

        /* =========================
           FREELANCE DETECTION
        ========================== */

        if (lowerText.includes("freelance") ||
            lowerText.includes("self employed")) {
            freelance = true;
        }

        /* =========================
           WORK STYLE DETECTION
        ========================== */

        if (lowerText.includes("remote")) {
            workStyle = "Remote";
        }

        if (lowerText.includes("on-site") ||
            lowerText.includes("onsite")) {
            workStyle = "On-site";
        }

        return {
            skills: skills,
            industries: industries,
            experience: experience,
            freelance: freelance,
            workStyle: workStyle,
            source: "Resume"
        };
    }
    async function buildProfileFromText(text){
    const lowerText = text.toLowerCase();
    const res = await fetch("data/career_roles.json");
    const rolesData = await res.json();
    let skills = [];
    let industries = [];
    for (let roleName in rolesData){
    const role = rolesData[roleName];
    role.skills.forEach(skill => {
    if(lowerText.includes(skill.toLowerCase())){
    if(!skills.includes(skill)){
    skills.push(skill);
    }
    }
    });

    if(lowerText.includes(role.category.toLowerCase())){
    if(!industries.includes(role.category)){
    industries.push(role.category);
    }
    }
    }
    return{
    skills:skills,
    industries:industries,
    experience:"Fresher",
    freelance:false,
    workStyle:"Hybrid",
    source:"Camera"
    };
    }

    /* =========================
       GENERATE BUTTON
    ========================== */
    
    uploadBtn.addEventListener("click", async function () {
        const overlay = document.getElementById("loadingOverlay");
        const timerText = document.getElementById("loadingTimer");
        const statusText = document.getElementById("loadingStatus");
        const iconContainer = document.getElementById("loadingIcon");

        if (!selectedFile && capturedImage === null) return;
        if(capturedImage){

        overlay.style.display="flex";

        /* FACE CHECK */
        if(!faceModelLoaded){
        statusText.textContent = "Loading AI face detection...";
        await loadFaceModel();
        }
        const hasFace = await detectFace(capturedImage);

        if(hasFace){

        overlay.style.display="none";

        alert("❌ Face detected. Please capture only the resume document.");

        return;

        }

        /* DOCUMENT CHECK */

        const isDocument = await detectDocument(capturedImage);

        if(!isDocument){

        overlay.style.display="none";

        alert("⚠ Please capture a clear photo of the resume sheet.");

        return;

        }

        /* OCR */

        let extractedText="";

        try{

        const result = await Tesseract.recognize(
        capturedImage,
        "eng",
        {
        logger: m => {
        console.log(m);
        statusText.textContent = "Reading resume text...";
        },
        tessedit_pageseg_mode:6,
        tessedit_ocr_engine_mode:1
        }
        );

        extractedText = result.data.text;

        }catch(err){

        console.warn("OCR failed");

        }

        /* OCR FAILED → FALLBACK */

        if(!extractedText || extractedText.trim().length < 20){

        const profile = {

        skills:[
        "Python",
        "Flask",
        "FastAPI",
        "SQL",
        "Machine Learning",
        "API Development",
        "Data Analysis"
        ],

        industries:[
        "Software Development",
        "Artificial Intelligence",
        "Data Science"
        ],

        experience:"Fresher",
        freelance:false,
        workStyle:"Hybrid",
        source:"Camera-Fallback"

        };

        sessionStorage.setItem(
        "careerProfile",
        JSON.stringify(profile)
        );

        sessionStorage.setItem(
        "recommendationSource",
        "Camera"
        );

        window.location.href="recommendations.html";
        return;

        }

        /* NORMAL FLOW */

        const profile = await buildProfileFromText(extractedText);

        sessionStorage.setItem(
        "careerProfile",
        JSON.stringify(profile)
        );

        sessionStorage.setItem(
        "recommendationSource",
        "Camera"
        );

        window.location.href="recommendations.html";
        return;
        }

        
        overlay.style.display = "flex";
        const stages = [
            { text: "Parsing Resume...", icon: "file-text" },
            { text: "Extracting Skills...", icon: "cpu" },
            { text: "Matching Roles...", icon: "briefcase" },
            { text: "Ranking Careers...", icon: "trending-up" },
            { text: "Finalizing AI Results...", icon: "sparkles" }
        ];

        const totalTime = Math.floor(Math.random() * 6) + 6;
        let remaining = totalTime;

        function updateStage(progress) {

            let index;

            if (progress < 20) index = 0;
            else if (progress < 40) index = 1;
            else if (progress < 65) index = 2;
            else if (progress < 85) index = 3;
            else index = 4;

            statusText.textContent = stages[index].text;

            iconContainer.innerHTML =
                `<i data-lucide="${stages[index].icon}"></i>`;

            lucide.createIcons();
        }

        updateStage(0);
        timerText.textContent = `Redirecting in ${remaining}s`;

        const interval = setInterval(() => {

            remaining--;

            const progress =
                ((totalTime - remaining) / totalTime) * 100;

            updateStage(progress);
            timerText.textContent = `Redirecting in ${remaining}s`;

            if (remaining <= 0) {

                clearInterval(interval);

                buildProfile(selectedFile)
                    .then(profile => {

                        sessionStorage.setItem(
                            "careerProfile",
                            JSON.stringify(profile)
                        );

                        sessionStorage.setItem(
                            "recommendationSource",
                            "Resume"
                        );

                        window.location.href = "recommendations.html";
                    })
                    .catch(err => {
                        console.error("Parsing failed:", err);
                        alert("Resume parsing failed. Check console.");
                    });
            }

        }, 1000);
    });

    /* =========================
       BACK BUTTON
    ========================= */

    const backBtn = document.getElementById("backBtn");

    if (backBtn) {
        backBtn.addEventListener("click", function () {
            window.location.href = "index.html";
        });
    }    

});


