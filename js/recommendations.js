document.addEventListener("DOMContentLoaded", async function () {

    const tabs = document.querySelectorAll(".tab-btn");
    const content = document.getElementById("tabContent");

    const profile = JSON.parse(sessionStorage.getItem("careerProfile"));

    if (!profile) {
        window.location.href = "assessment.html";
        return;
    }

    /* =========================
       SET SOURCE TEXT
    ========================= */

    const source = sessionStorage.getItem("recommendationSource");
    const sourceText = document.getElementById("recommendationSourceText");

    if (sourceText) {
        if (source === "Resume") {
            sourceText.innerText = "Generated from your uploaded resume";
        } else {
            sourceText.innerText = "Generated from your questionnaire";
        }
    }    

    let results = [];
    let fallbackMode = false;

    /* =========================
       LOAD JSON + ENGINE
    ========================== */

    try {

        const response = await fetch("./data/career_roles.json");

        if (!response.ok) throw new Error("Fetch failed");

        const rolesData = await response.json();

        results = generateRecommendations(profile, rolesData);

        if (!results || results.length === 0) {
            fallbackMode = true;
        }

    } catch (err) {

        console.error("Recommendation error:", err);
        fallbackMode = true;
    }      
    /* =========================
       SAVE TO DASHBOARD HISTORY
    ========================= */

    if (results && results.length > 0) {

        const loginUser = JSON.parse(sessionStorage.getItem("currentUser"));

        if (loginUser) {

            const userKey = `careerHistory_${loginUser.name.trim().toLowerCase()}`;

            let existingHistory =
                JSON.parse(localStorage.getItem(userKey)) || [];

            const now = new Date();

            const entry = {
                id: Date.now(), // unique ID (prevents duplicate forever)
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                source:
                    sessionStorage.getItem("recommendationSource") || "Questionnaire"
            };

            // Prevent duplicate save on refresh
            const isDuplicate =
                existingHistory.length > 0 &&
                existingHistory[0].source === entry.source &&
                existingHistory[0].date === entry.date &&
                existingHistory[0].time === entry.time;

            if (!isDuplicate) {

                existingHistory.unshift(entry);

                localStorage.setItem(
                    userKey,
                    JSON.stringify(existingHistory)
                );
            }
        }
    }

    /* =========================
       TAB RENDER FUNCTION
    ========================== */

    function loadTab(type) {

        content.innerHTML = "";

        /* =========================
           CAREER PATHS
        ========================== */
        if (type === "paths") {

            if (!fallbackMode) {

                results.slice(0, 6).forEach(role => {

                    content.innerHTML += `
                        <div class="card career-card">
                            <span class="badge badge-high">${role.level || "Level"}</span>
                            <h3>${role.role}</h3>
                            <p>${role.description || "Career role in modern industry."}</p>
                            <p><strong>Career Path:</strong> ${role.careerPath || "-"}</p>
                            <p><strong>Transition Time:</strong> ${role.transitionTime || "6–12 months"}</p>
                            <p><strong>Fresher Salary:</strong> ${role.salaryINR?.fresher || "₹4 LPA – ₹8 LPA"}</p>
                        </div>
                    `;
                });

            } else {

                const fallbackCareers = [
                    "Python Developer",
                    "Full Stack Developer",
                    "Frontend Developer",
                    "Backend Developer",
                    "SQL Developer",
                    "Software Engineer"
                ];

                fallbackCareers.forEach(role => {
                    content.innerHTML += `
                        <div class="card career-card">
                            <span class="badge badge-high">Trending</span>
                            <h3>${role}</h3>
                            <p>High demand technology career path.</p>
                            <p><strong>Transition Time:</strong> 6–12 months</p>
                            <p><strong>Fresher Salary:</strong> ₹4 LPA – ₹8 LPA</p>
                        </div>
                    `;
                });
            }
        }

        /* =========================
           ROLES
        ========================== */
        if (type === "roles") {

            if (!fallbackMode) {

                results.slice(0, 6).forEach(role => {

                    const requiredSkills = role.requiredSkills
                        ? role.requiredSkills.slice(0, 6).map(skill => 
                            `<span>${skill}</span>`
                          ).join("")
                        : "<span>Core Technical Skills</span>";

                    content.innerHTML += `
                        <div class="card role-card-clean">

                            <div class="role-header">
                                <h3>${role.role}</h3>
                                <div class="match-badge">
                                    ${Math.min(role.score || 75, 100)}%
                                </div>
                            </div>

                            <p class="role-description">
                                ${role.description || "High-demand technical role."}
                            </p>

                            <div class="skills-label">Required Skills</div>

                            <div class="skill-tags">
                                ${requiredSkills}
                            </div>

                        </div>
                    `;
                });

            } else {

                const staticRoles = [
                    { title: "Python Developer", match: 85 },
                    { title: "Full Stack Developer", match: 82 },
                    { title: "Frontend Developer", match: 78 },
                    { title: "Backend Developer", match: 76 },
                    { title: "SQL Analyst", match: 74 },
                    { title: "JavaScript Developer", match: 80 }
                ];

                staticRoles.forEach(role => {
                    content.innerHTML += `
                        <div class="card role-card-clean">

                            <div class="role-header">
                                <h3>${role.title}</h3>
                                <div class="match-badge">
                                    ${role.match}%
                                </div>
                            </div>

                            <p class="role-description">
                                Core high-demand technical role.
                            </p>

                            <div class="skills-label">Required Skills</div>

                            <div class="skill-tags">
                                <span>Problem Solving</span>
                                <span>APIs</span>
                                <span>Database</span>
                                <span>Git</span>
                            </div>

                        </div>
                    `;
                });
            }
        }

        /* =========================
           SKILLS
        ========================== */
        if (type === "skills") {

            if (!fallbackMode) {

                results.slice(0, 6).forEach(role => {

                    (role.skills || []).slice(0, 2).forEach(skill => {
                        content.innerHTML += `
                            <div class="card">
                                <span class="badge badge-medium">Skill</span>
                                <h3>${skill}</h3>
                                <p>Important technical capability for ${role.role}.</p>
                                <p><strong>Time Investment:</strong> 2–4 months</p>
                            </div>
                        `;
                    });

                });

            } else {

                const skills = ["Python","React","SQL","Cloud","System Design","Testing"];

                skills.forEach(skill => {
                    content.innerHTML += `
                        <div class="card">
                            <span class="badge badge-medium">Skill</span>
                            <h3>${skill}</h3>
                            <p>Core modern industry skill.</p>
                            <p><strong>Time Investment:</strong> 2–4 months</p>
                        </div>
                    `;
                });
            }
        }

        /* =========================
           SKILL GAP
        ========================== */
        if (type === "skillgap") {

            if (!fallbackMode) {

                results.slice(0, 6).forEach(role => {

                    (role.skillGapFocus || []).slice(0, 1).forEach(skill => {
                        content.innerHTML += `
                            <div class="card">
                                <span class="badge badge-high">Missing</span>
                                <h3>${skill}</h3>
                                <p>Improving this will increase your match strength.</p>
                            </div>
                        `;
                    });

                });

            } else {

                const gaps = ["DevOps","Cloud Deployment","Security","Testing","Microservices","Advanced SQL"];

                gaps.forEach(skill => {
                    content.innerHTML += `
                        <div class="card">
                            <span class="badge badge-high">Missing</span>
                            <h3>${skill}</h3>
                            <p>Recommended improvement area.</p>
                        </div>
                    `;
                });
            }
        }

        /* =========================
           RESOURCES
        ========================== */
        if (type === "resources") {

            if (!fallbackMode) {

                results.slice(0, 3).forEach(role => {

                    (role.learningResources || []).forEach(resource => {
                        content.innerHTML += `
                            <div class="card">
                                <h3>${resource.title}</h3>
                                <p><strong>Provider:</strong> ${resource.provider}</p>
                                <p><strong>Duration:</strong> ${resource.duration}</p>
                            </div>
                        `;
                    });

                });

            } else {

                const fallbackResources = [
                    { title: "Full Stack Bootcamp", provider: "Udemy", duration: "3 months" },
                    { title: "Advanced Python", provider: "Coursera", duration: "2 months" },
                    { title: "Cloud Fundamentals", provider: "AWS", duration: "2 months" },
                    { title: "SQL Mastery", provider: "Oracle", duration: "1–2 months" },
                    { title: "System Design", provider: "Educative", duration: "2 months" },
                    { title: "DevOps Basics", provider: "Udemy", duration: "1–2 months" }
                ];

                fallbackResources.forEach(resource => {
                    content.innerHTML += `
                        <div class="card">
                            <h3>${resource.title}</h3>
                            <p><strong>Provider:</strong> ${resource.provider}</p>
                            <p><strong>Duration:</strong> ${resource.duration}</p>
                        </div>
                    `;
                });
            }
        }

        lucide.createIcons();
    }

    /* =========================
       TAB EVENTS
    ========================== */

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            loadTab(this.getAttribute("data-tab"));
        });
    });

    loadTab("paths");

    const downloadBtn = document.getElementById("downloadReport");

    if (downloadBtn) {
        downloadBtn.addEventListener("click", function () {
            generatePDF();
        });
    }

    function generatePDF() {

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const loginUser = JSON.parse(sessionStorage.getItem("currentUser"));
        const username = loginUser ? loginUser.name : "User";

        let y = 20;

        /* =========================
           TITLE
        ========================== */

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("CareerAI Personalized Report", 20, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("User: " + username, 20, y);
        y += 6;

        doc.text("Generated By: CareerAI Engine", 20, y);
        y += 10;

        doc.line(20, y, 190, y);
        y += 15;

        /* =========================
           TOP CAREER MATCHES TABLE
        ========================== */

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Top Career Matches", 20, y);
        y += 8;

        const tableData = [];

        if (!fallbackMode && results.length > 0) {

            results.slice(0, 3).forEach(role => {
                tableData.push([
                    role.role,
                    (Math.min(role.score || 75, 100)) + "%",
                    role.salaryINR?.fresher || "₹4–8 LPA"
                ]);
            });

        } else {

            tableData.push(
                ["Python Developer", "85%", "₹4–8 LPA"],
                ["Full Stack Developer", "82%", "₹5–10 LPA"],
                ["Frontend Developer", "78%", "₹4–9 LPA"]
            );
        }

        doc.autoTable({
            startY: y,
            head: [["Role", "Match %", "Fresher Salary (INR)"]],
            body: tableData,
            theme: "grid",
            headStyles: {
                fillColor: [200, 200, 200],
                textColor: 0
            },
            styles: {
                fontSize: 11
            }
        });

        y = doc.lastAutoTable.finalY + 15;

        /* =========================
           SKILL GAP SECTION
        ========================== */

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Skill Gap Analysis", 20, y);
        y += 8;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        let skillGaps = [];

        if (!fallbackMode && results.length > 0) {
            results.slice(0, 2).forEach(role => {
                (role.skillGapFocus || []).slice(0, 2).forEach(skill => {
                    skillGaps.push(skill);
                });
            });
        } else {
            skillGaps = [
                "Cloud Deployment",
                "System Design",
                "Advanced Testing",
                "Security Fundamentals"
            ];
        }

        skillGaps.forEach(skill => {
            doc.text("• " + skill, 25, y);
            y += 6;
        });

        y += 10;

        /* =========================
           RECOMMENDED LEARNING PATH
        ========================== */

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Recommended Learning Path", 20, y);
        y += 8;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        const learningSteps = [
            "Complete Advanced Course (2 months)",
            "Build 2 Industry-Level Projects",
            "Learn Cloud Fundamentals (AWS/Azure)",
            "Practice System Design Basics"
        ];

        learningSteps.forEach(step => {
            doc.text("• " + step, 25, y);
            y += 6;
        });

        y += 15;

        doc.line(20, y, 190, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(
            "Generated by CareerAI – Intelligent Career Path Recommendation System",
            20,
            y
        );

        doc.save(username + "_CareerAI_Report.pdf");
    }

        /* =========================
           BACK TO DASHBOARD
        ========================= */

        const backLink = document.querySelector(".back-link");

        if (backLink) {
            backLink.addEventListener("click", function () {
                window.location.href = "dashboard.html";
            });
        }

        /* =========================
           LOGOUT
        ========================= */

        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {

                // Clear session
                sessionStorage.clear();

                // Redirect to login
                window.location.href = "index.html";
            });
        }

        const homeBtn = document.getElementById("homeBtn");

        if (homeBtn) {
            homeBtn.addEventListener("click", function () {
                window.location.href = "index.html";
            });
        }

});

