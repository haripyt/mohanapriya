let currentStep = 1;

/* ===============================
   STEP PROGRESS
=============================== */
function updateProgress() {
    document.getElementById("progressFill").style.width =
        (currentStep / 3) * 100 + "%";

    document.getElementById("stepText").innerText =
        "Step " + currentStep + " of 3";
}

function showStep(step) {
    document.querySelectorAll(".step").forEach(s =>
        s.classList.remove("active")
    );

    document.getElementById("step" + step).classList.add("active");
    updateProgress();
}

function nextStep() {
    if (currentStep < 3) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

/* ===============================
   TAG MANAGEMENT
=============================== */
let skillList = [];
let interestList = [];
let industryList = [];

function addTag(type) {

    const input = document.getElementById(type + "Input");
    const value = input.value.trim();

    if (!value) return;

    let list;

    if (type === "skill") list = skillList;
    if (type === "interest") list = interestList;
    if (type === "industry") list = industryList;

    if (list.includes(value)) {
        input.value = "";
        return;
    }

    list.push(value);
    renderTags(type);
    input.value = "";
}

function removeTag(type, value) {

    if (type === "skill")
        skillList = skillList.filter(item => item !== value);

    if (type === "interest")
        interestList = interestList.filter(item => item !== value);

    if (type === "industry")
        industryList = industryList.filter(item => item !== value);

    renderTags(type);
}

function renderTags(type) {

    const container = document.getElementById(type + "Tags");

    let list;

    if (type === "skill") list = skillList;
    if (type === "interest") list = interestList;
    if (type === "industry") list = industryList;

    container.innerHTML = "";

    list.forEach(item => {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.innerHTML = `
            ${item}
            <button onclick="removeTag('${type}', '${item}')">×</button>
        `;
        container.appendChild(tag);
    });
}

/* ===============================
   GLOBAL JSON LOADER (FIXED)
=============================== */

let rolesCache = {};

async function loadRoles() {
    if (Object.keys(rolesCache).length) return rolesCache;

    const res = await fetch("./data/career_roles.json");
    if (!res.ok) throw new Error("Failed to load career data");
    rolesCache = await res.json();
    return rolesCache;
}

/* ===============================
   SKILL + INTEREST AUTOCOMPLETE
=============================== */

document.addEventListener("DOMContentLoaded", function () {

    const skillInput = document.getElementById("skillInput");
    const skillDropdown = document.getElementById("skillDropdown");

    const interestInput = document.getElementById("interestInput");
    const interestDropdown = document.getElementById("interestDropdown");

    const industryInput = document.getElementById("industryInput");
    const industryDropdown = document.getElementById("industryDropdown");

    const generateBtn = document.getElementById("generateBtn");

    function validateForm() {

        const hasSkills = skillList.length > 0;
        const hasInterests = interestList.length > 0;
        const hasIndustries = industryList.length > 0;

        const experience = document.getElementById("experienceInput")?.value;
        const workStyle = document.getElementById("workStyleInput")?.value;

        const valid =
            hasSkills &&
            hasInterests &&
            hasIndustries &&
            experience &&
            workStyle;

        generateBtn.disabled = !valid;

        if (!valid) {
            generateBtn.style.opacity = "0.6";
            generateBtn.style.cursor = "not-allowed";
        } else {
            generateBtn.style.opacity = "1";
            generateBtn.style.cursor = "pointer";
        }
    }

    // Re-check whenever tags update
    const originalAddTag = addTag;

    window.addTag = function(type) {
        originalAddTag(type);
        validateForm();
    };

    document.getElementById("experienceInput")
        ?.addEventListener("change", validateForm);

    document.getElementById("workStyleInput")
        ?.addEventListener("change", validateForm);

    validateForm(); // Initial check

    /* ========= SKILL AUTOCOMPLETE ========= */

    if (skillInput && skillDropdown) {

        skillInput.addEventListener("input", async function () {

            const query = this.value.toLowerCase().trim();
            if (!query) {
                skillDropdown.style.display = "none";
                return;
            }

            const rolesData = await loadRoles();
            const suggestions = [];

            for (let role in rolesData) {

                if (role.toLowerCase().includes(query)) {
                    suggestions.push({
                        label: role,
                        category: rolesData[role].category
                    });
                }

                rolesData[role].skills.forEach(skill => {
                    if (skill.toLowerCase().includes(query)) {
                        suggestions.push({
                            label: skill,
                            category: rolesData[role].category
                        });
                    }
                });
            }

            renderDropdown(skillDropdown, suggestions, "skill");
        });
    }

    /* ========= INTEREST AUTOCOMPLETE ========= */

    if (interestInput && interestDropdown) {

        interestInput.addEventListener("input", async function () {

            const query = this.value.toLowerCase().trim();
            if (!query) {
                interestDropdown.style.display = "none";
                return;
            }

            const rolesData = await loadRoles();
            const suggestions = [];

            for (let role in rolesData) {

                if (role.toLowerCase().includes(query)) {
                    suggestions.push({
                        label: role,
                        category: rolesData[role].category
                    });
                }

                if (rolesData[role].category.toLowerCase().includes(query)) {
                    suggestions.push({
                        label: rolesData[role].category,
                        category: "Category"
                    });
                }
            }

            renderDropdown(interestDropdown, suggestions, "interest");
        });
    }

    /* ========= INDUSTRY AUTOCOMPLETE ========= */

    if (industryInput && industryDropdown) {

        industryInput.addEventListener("input", async function () {

            const query = this.value.toLowerCase().trim();

            if (!query) {
                industryDropdown.style.display = "none";
                return;
            }

            const rolesData = await loadRoles();
            const suggestions = [];

            for (let role in rolesData) {

                const category = rolesData[role].category;

                if (category.toLowerCase().includes(query)) {
                    suggestions.push({
                        label: category,
                        category: "Industry"
                    });
                }
            }

            renderDropdown(industryDropdown, suggestions, "industry");
        });
    }

    /* ========= COMMON DROPDOWN RENDER ========= */

    function renderDropdown(dropdown, suggestions, type) {

        const unique = [];
        const seen = new Set();

        suggestions.forEach(item => {
            if (!seen.has(item.label)) {
                seen.add(item.label);
                unique.push(item);
            }
        });

        if (!unique.length) {
            dropdown.style.display = "none";
            return;
        }

        dropdown.innerHTML = "";

        unique.slice(0, 8).forEach(item => {

            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.innerHTML = `
                <span>${item.label}</span>
                <span class="autocomplete-category">${item.category}</span>
            `;

            div.addEventListener("click", function () {

                document.getElementById(type + "Input").value = item.label;
                addTag(type);
                dropdown.style.display = "none";
            });

            dropdown.appendChild(div);
        });

        dropdown.style.display = "block";
    }

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".autocomplete-wrapper")) {
            document.querySelectorAll(".autocomplete-dropdown")
                .forEach(d => d.style.display = "none");
        }
    });

});


/* ===============================
   GENERATE (UNCHANGED LOGIC)
=============================== */
function generate() {

    const overlay = document.getElementById("loadingOverlay");
    const timerText = document.getElementById("loadingTimer");
    const statusText = document.getElementById("loadingStatus");
    const iconContainer = document.getElementById("loadingIcon");

    overlay.style.display = "flex";

    const stages = [
        { text: "Analyzing Profile...", icon: "user-search" },
        { text: "Aligning Skills...", icon: "layers" },
        { text: "Scoring Roles...", icon: "bar-chart-3" },
        { text: "Finalizing AI Results...", icon: "sparkles" }
    ];

    const totalTime = Math.floor(Math.random() * 11) + 15;
    let remaining = totalTime;

    timerText.textContent = `Redirecting in ${remaining}s`;

    function updateStage(progressPercent) {

        let stageIndex;

        if (progressPercent < 30) stageIndex = 0;
        else if (progressPercent < 60) stageIndex = 1;
        else if (progressPercent < 85) stageIndex = 2;
        else stageIndex = 3;

        statusText.textContent = stages[stageIndex].text;

        iconContainer.innerHTML =
            `<i data-lucide="${stages[stageIndex].icon}"></i>`;

        lucide.createIcons();
    }

    updateStage(0);

    const timerInterval = setInterval(() => {

        remaining--;

        const progress =
            ((totalTime - remaining) / totalTime) * 100;

        updateStage(progress);

        timerText.textContent = `Redirecting in ${remaining}s`;

        if (remaining <= 0) {

            clearInterval(timerInterval);

            const storedUser =
                JSON.parse(sessionStorage.getItem("currentUser"));

            const recommendationData = {
                source: "Questionnaire",
                date: new Date().toLocaleDateString(),
                user: storedUser?.name || "User",
                skills: skillList,
                interests: interestList,
                industries: industryList,
                generatedAt: new Date().toISOString()
            };

            localStorage.setItem(
                "currentRecommendation",
                JSON.stringify(recommendationData)
            );

            sessionStorage.setItem(
                "careerProfile",
                JSON.stringify({
                    skills: skillList,
                    interests: interestList,
                    industries: industryList,
                    experience: document.getElementById("experienceInput")?.value,
                    workStyle: document.getElementById("workStyleInput")?.value
                })
            );
            sessionStorage.setItem(
                "recommendationSource",
                "Questionnaire"
            );
            window.location.href = "recommendations.html";
        }

    }, 1000);
}

document.addEventListener("DOMContentLoaded", function(){

const slides = document.querySelectorAll(".carousel-slide");
const dotsContainer = document.querySelector(".carousel-dots");

if(!slides.length) return;

let index = 0;

/* CREATE DOTS */

slides.forEach((_,i)=>{

let dot=document.createElement("span");

if(i===0) dot.classList.add("active");

dot.addEventListener("click",()=>showSlide(i));

dotsContainer.appendChild(dot);

});

const dots=document.querySelectorAll(".carousel-dots span");

/* SHOW SLIDE */

function showSlide(i){

slides.forEach(s=>s.classList.remove("active"));
dots.forEach(d=>d.classList.remove("active"));

index=i;

slides[index].classList.add("active");
dots[index].classList.add("active");

}

/* AUTO SLIDE */

function autoSlide(){

index=(index+1)%slides.length;

showSlide(index);

}

/* START */

showSlide(0);

setInterval(autoSlide,4000);

});


/* ================= INFO TABS ================= */

document.addEventListener("DOMContentLoaded", function(){

const tabs = document.querySelectorAll(".info-tab");
const contents = document.querySelectorAll(".info-content");

tabs.forEach(tab => {

tab.addEventListener("click", () => {

const target = tab.dataset.tab;

/* remove active */

tabs.forEach(t => t.classList.remove("active"));
contents.forEach(c => c.classList.remove("active"));

/* activate */

tab.classList.add("active");

document.getElementById(target).classList.add("active");

});

});

});

/* ================= INFO SLIDER ================= */

document.addEventListener("DOMContentLoaded", function(){

const sections = document.querySelectorAll(".info-content");

sections.forEach(section=>{

const track = section.querySelector(".info-track");
const items = section.querySelectorAll(".info-track .info-item");

if(!track || items.length <= 1) return;

let index = 0;

setInterval(()=>{

index++;

if(index >= items.length){
index = 0;
}

track.style.transform = `translateX(-${index * 100}%)`;

},3000);

});

});