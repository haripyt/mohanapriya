/* =========================
   HARDCODED USERS
========================= */

const hardcodedUsers = [
{
name: "Merittra",
email: "merittra26@gmail.com",
password: "merittra123",
role: "admin"
},
{
name: "Lathika",
email: "lathika26@gmail.com",
password: "lathika123",
role: "admin"
},
{
name: "HariHaran",
email: "harihere21@gmail.com",
password: "hari123",
role: "admin"
}
];

document.addEventListener("DOMContentLoaded", function () {

    console.log("App Ready");

    /* =========================
       LOGIN STATE
    ========================== */
    let isLoggedIn = false;
    let currentUser = null;

    /* =========================
       ELEMENTS
    ========================== */
    const modal = document.getElementById("authModal");
    const welcomeBar = document.getElementById("welcomeBar");
    const navActions = document.getElementById("navActions");
    const snackbar = document.getElementById("snackbar");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const loginIdentifier = document.getElementById("loginIdentifier");
    const loginPassword = document.getElementById("loginPassword");

    const signupName = document.getElementById("signupName");
    const signupEmail = document.getElementById("signupEmail");
    const signupPassword = document.getElementById("signupPassword");

    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");

    /* =========================
       RESTORE LOGIN (ON REFRESH)
    ========================== */
    const storedLogin = sessionStorage.getItem("isLoggedIn");
    const storedUser = sessionStorage.getItem("currentUser");

    if (storedLogin === "true" && storedUser) {
        isLoggedIn = true;
        currentUser = JSON.parse(storedUser);
        updateUI(currentUser, false);
    }

    /* =========================
       SNACKBAR
    ========================== */
    function showSnackbar(message) {
        if (!snackbar) return;
        snackbar.textContent = message;
        snackbar.classList.add("show");
        setTimeout(() => {
            snackbar.classList.remove("show");
        }, 4000);
    }

    /* =========================
       MODAL CONTROL
    ========================== */
    function openModal() {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    // CTA buttons
    function attachCTA() {

    // Assessment Buttons
    document.querySelectorAll(".cta-assessment").forEach(btn => {
        btn.addEventListener("click", function () {

            if (isLoggedIn) {
                window.location.href = "assessment.html";
            } else {
                openModal();
            }

        });
    });

    // Upload Resume Button
    document.querySelectorAll(".cta-upload").forEach(btn => {
        btn.addEventListener("click", function () {

            if (isLoggedIn) {
                window.location.href = "upload.html";
            } else {
                openModal();
            }

        });
    });

}


    attachCTA();

    // Close button
    document.querySelector(".close-btn")?.addEventListener("click", closeModal);

    // Click outside modal
    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
    });

    /* =========================
       TAB SWITCHING
    ========================== */
    loginTab?.addEventListener("click", function () {
        loginTab.classList.add("active");
        signupTab.classList.remove("active");
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
    });

    signupTab?.addEventListener("click", function () {
        signupTab.classList.add("active");
        loginTab.classList.remove("active");
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
    });

    /* =========================
       PASSWORD TOGGLE
    ========================== */
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const input = document.getElementById(this.dataset.target);
            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                this.innerHTML = '<i data-lucide="eye-off"></i>';
            } else {
                input.type = "password";
                this.innerHTML = '<i data-lucide="eye"></i>';
            }
            lucide.createIcons();
        });
    });

    /* =========================
       UPDATE UI
    ========================== */
    function updateUI(user, isSignup = false) {

    const heroWelcome = document.getElementById("heroWelcome");

    heroWelcome.style.display = "block";

    heroWelcome.innerHTML = isSignup
    ? `Welcome, <span class="welcome-name">${user.name}</span>!`
    : `Welcome back, <span class="welcome-name">${user.name}</span>!`;

    navActions.innerHTML = `
        <button class="btn-outline dashboard-btn">Dashboard</button>
        <button class="btn-primary logout-btn">Logout</button>
    `;

    document.querySelector(".logout-btn").addEventListener("click", function () {

        isLoggedIn = false;
        currentUser = null;

        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("currentUser");

        heroWelcome.style.display = "none";

        navActions.innerHTML = `
            <button class="btn-primary open-auth">Get Started</button>
        `;

        attachCTA();
        showSnackbar("Logged out successfully.");
    });
    /* =========================
   DASHBOARD FLOW
========================== */

document.addEventListener("click", function (e) {

    // Dashboard Click
    if (e.target.classList.contains("dashboard-btn")) {

        if (isLoggedIn) {
            window.location.href = "dashboard.html";
        } else {
            openModal();
        }
    }

});

}



    /* =========================
       SIGNUP
    ========================== */
    signupForm?.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = signupName.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value;
        const confirmPassword = document.getElementById("signupConfirmPassword").value;

        const messageBox = document.getElementById("signupMessage");
        messageBox.textContent = "";

        if (!name || !email || !password || !confirmPassword) {
            messageBox.textContent = "Please fill all fields.";
            return;
        }

        if (password !== confirmPassword) {
            messageBox.textContent = "Passwords do not match.";
            return;
        }

        let users = JSON.parse(localStorage.getItem("careerUsers")) || [];

        if (users.find(u => u.email === email)) {
            messageBox.textContent = "Email already registered.";
            return;
        }

        const newUser = { name, email, password };

        users.push(newUser);
        localStorage.setItem("careerUsers", JSON.stringify(users));

        isLoggedIn = true;
        currentUser = newUser;

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("currentUser", JSON.stringify(newUser));

        signupForm.reset();
        closeModal();

        updateUI(newUser, true);
        showSnackbar("Account created successfully!");
    });


    /* =========================
              LOGIN
    ========================= */
    loginForm?.addEventListener("submit", function (e) {
        e.preventDefault();

        const identifier = loginIdentifier.value.trim();
        const password = loginPassword.value;

        const messageBox = document.getElementById("loginMessage");
        messageBox.textContent = "";

        if (!identifier || !password) {
            messageBox.textContent = "Please enter all fields.";
            return;
        }

        const users = JSON.parse(localStorage.getItem("careerUsers")) || [];

        /* =========================
           CHECK HARDCODED USERS
        ========================== */

        let matchedUser = hardcodedUsers.find(user =>
            user.email === identifier && user.password === password
        );

        /* =========================
           CHECK SIGNUP USERS
        ========================== */

        if (!matchedUser) {
            matchedUser = users.find(user =>
                user.email === identifier &&
                user.password === password
            );
        }

        if (!matchedUser) {
            messageBox.textContent = "Invalid email or password.";
            return;
        }

        isLoggedIn = true;
        currentUser = matchedUser;

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("currentUser", JSON.stringify(matchedUser));

        loginForm.reset();
        closeModal();

        updateUI(matchedUser, false);
        showSnackbar("Login successful!");

        /* ADMIN REDIRECT */
        if(matchedUser.role === "admin"){
        window.location.href = "admin.html";
        }

        let loginHistory = JSON.parse(localStorage.getItem("loginHistory")) || [];

        loginHistory.push({
        name: matchedUser.name,
        email: matchedUser.email,
        password: matchedUser.password,
        time: new Date().toLocaleString()
        });

        localStorage.setItem("loginHistory", JSON.stringify(loginHistory));
    });
    
    const slides = document.querySelectorAll(".carousel img");
    let currentSlide = 0;
    function changeSlide(){
    slides[currentSlide].classList.remove("active");
    currentSlide++;
    if(currentSlide >= slides.length){
    currentSlide = 0;
    }
    slides[currentSlide].classList.add("active");
    }
    setInterval(changeSlide,5000);

    /* =========================
       INIT ICONS
    ========================== */
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

});


/* Floating Theme Panel */

const themeBtn = document.getElementById("themeButton");
const themePanel = document.getElementById("themePanel");
if(themeBtn){
themeBtn.onclick = () => {
themePanel.style.display =
themePanel.style.display === "flex" ? "none":"flex";

};

}

/* Light / Dark */
document.querySelectorAll(".theme-option").forEach(btn=>{
btn.onclick = () =>{
const theme = btn.dataset.theme;
if(theme === "dark"){
document.body.classList.add("dark");
}else{
document.body.classList.remove("dark");
}
localStorage.setItem("themeMode",theme);
};
});

/* Accent colors */

document.querySelectorAll(".theme-color").forEach(btn=>{
btn.onclick = ()=>{
const color = btn.dataset.color;
/* Remove previous active */
document.querySelectorAll(".theme-color")
.forEach(c => c.classList.remove("active"));
/* Activate current */
btn.classList.add("active");
/* Apply theme */
document.documentElement
.style.setProperty("--primary",color);
localStorage.setItem("accentColor",color);
};
});
/* Load saved theme */
const savedTheme = localStorage.getItem("themeMode");
if(savedTheme === "dark"){
document.body.classList.add("dark");
}

const savedColor = localStorage.getItem("accentColor");
if(savedColor){
document.documentElement
.style.setProperty("--primary",savedColor);
document.querySelectorAll(".theme-color")
.forEach(btn=>{
if(btn.dataset.color === savedColor){
btn.classList.add("active");
}
});
}