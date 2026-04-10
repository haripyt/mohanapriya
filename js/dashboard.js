/* APPLY SAVED THEME */

const savedTheme = localStorage.getItem("themeMode");
const savedColor = localStorage.getItem("accentColor");

if(savedTheme === "dark"){
document.body.classList.add("dark");
}else{
document.body.classList.remove("dark");
}

if(savedColor){
document.documentElement.style
.setProperty("--primary", savedColor);
}
document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       AUTH CHECK (UNCHANGED)
    ========================== */

    const storedLogin = sessionStorage.getItem("isLoggedIn");
    const storedUser = sessionStorage.getItem("currentUser");

    if (storedLogin !== "true" || !storedUser) {
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(storedUser);
    const userKey = `careerHistory_${user.name.trim().toLowerCase()}`;

    /* =========================
       ELEMENTS
    ========================== */

    const welcomeText = document.getElementById("welcomeText");
    const welcomeSubText = document.getElementById("welcomeSubText");
    const emptyState = document.getElementById("emptyState");
    const recommendationSection = document.getElementById("recommendationSection");
    const startBtn = document.getElementById("startAssessmentBtn");
    const newAssessmentCard = document.getElementById("newAssessmentCard");
    const uploadResumeCard = document.getElementById("uploadResumeCard");
    const logoutBtn = document.querySelector(".nav-outline");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const homeBtn = document.getElementById("homeBtn");

    /* =========================
       WELCOME
    ========================== */

    if (welcomeText) {
        welcomeText.textContent = `Welcome back, ${user.name}!`;
    }

    /* =========================
       NAVIGATION (UNCHANGED)
    ========================== */

    startBtn?.addEventListener("click", () => {
        window.location.href = "assessment.html";
    });

    newAssessmentCard?.addEventListener("click", () => {
        window.location.href = "assessment.html";
    });

    uploadResumeCard?.addEventListener("click", () => {
        window.location.href = "upload.html";
    });

    homeBtn?.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    logoutBtn?.addEventListener("click", () => {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem("careerProfile");
        sessionStorage.removeItem("recommendationSource");
        window.location.href = "index.html";
    });

    /* =========================
       LOAD HISTORY (STABLE)
    ========================== */

    function loadHistory() {

        let dashboardHistory =
            JSON.parse(localStorage.getItem(userKey)) || [];

        /* Remove duplicate entries permanently */
        dashboardHistory = dashboardHistory.filter((item, index, self) =>
            index === self.findIndex(t =>
                t.date === item.date &&
                t.time === item.time &&
                t.source === item.source
            )
        );

        /* Rewrite cleaned history back to localStorage */
        localStorage.setItem(
            userKey,
            JSON.stringify(dashboardHistory)
        );

        if (dashboardHistory.length === 0) {

            emptyState.style.display = "block";
            recommendationSection.style.display = "none";
            clearAllBtn.style.display = "none";

            if (welcomeSubText) {
                welcomeSubText.textContent =
                    "Start your career journey with an assessment or upload your resume.";
            }

            return;
        }

        emptyState.style.display = "none";
        recommendationSection.style.display = "grid";
        recommendationSection.innerHTML = "";
        clearAllBtn.style.display = "inline-block";

        if (welcomeSubText) {
            welcomeSubText.textContent =
                "Here are your recent AI-generated career recommendations.";
        }

        dashboardHistory.forEach((item, index) => {

            recommendationSection.innerHTML += `
                <div class="recommendation-card">
                    <div class="card-header">
                        <span class="card-type">#${dashboardHistory.length - index}</span>
                    </div>

                    <h3>Your Career Recommendations</h3>

                    <div class="card-meta">
                        <span>${item.date}</span>
                        <span>${item.time}</span>
                    </div>

                    <div class="card-stats">
                        <span>From ${item.source}</span>
                        <span>AI Generated</span>
                    </div>

                    <div class="card-actions">
                        <button class="view-btn" data-index="${index}">
                            View
                        </button>
                        <button class="delete-btn" data-index="${index}">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        });

        /* VIEW BUTTON (SAFE — NO DUPLICATE SAVE) */
        document.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", function () {

                // IMPORTANT: prevent duplicate save
                sessionStorage.removeItem("isNewGeneration");

                window.location.href = "recommendations.html";
            });
        });

        /* DELETE BUTTON */
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", function () {

                const index = this.getAttribute("data-index");
                const history =
                    JSON.parse(localStorage.getItem(userKey)) || [];

                history.splice(index, 1);

                localStorage.setItem(userKey, JSON.stringify(history));

                loadHistory();
            });
        });
    }

    loadHistory();

    /* =========================
       CLEAR ALL
    ========================== */

    clearAllBtn?.addEventListener("click", () => {

        if (confirm("Clear all history?")) {
            localStorage.removeItem(userKey);
            loadHistory();
        }
    });

});
