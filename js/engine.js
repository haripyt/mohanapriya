function generateRecommendations(profile, rolesData) {

    let results = [];

    for (let roleName in rolesData) {

        const role = rolesData[roleName];

        let totalScore = 0;
        let maxScore = 100;

        /* =========================
           1️⃣ SKILL MATCH (40)
        ========================== */
        let skillScore = 0;

        if (profile.skills && profile.skills.length > 0) {
        const matchedSkills = profile.skills.filter(skill =>
            role.skills.some(roleSkill => {

                const userSkill = skill.toLowerCase();
                const jobSkill = roleSkill.toLowerCase();

                return (
                    userSkill === jobSkill ||
                    userSkill.includes(jobSkill) ||
                    jobSkill.includes(userSkill)
                );

            })
        );

            const matchRatio = matchedSkills.length / Math.max(role.skills.length, profile.skills.length)
            skillScore = matchRatio * 40;

        }

        totalScore += skillScore;

        /* =========================
           2️⃣ INDUSTRY MATCH (15)
        ========================== */
        if (profile.industries &&
            profile.industries.some(ind =>
                ind.toLowerCase() === role.category.toLowerCase()
            )) {
            totalScore += 15;
        }

        /* =========================
           3️⃣ EXPERIENCE MATCH (15)
        ========================== */
        const experienceMap = {
            "Fresher": "Beginner",
            "1+": "Beginner",
            "2+": "Intermediate",
            "3+": "Intermediate",
            "5+": "Intermediate",
            "10+": "Expert"
        };

        if (experienceMap[profile.experience] === role.level) {
            totalScore += 15;
        }

        /* =========================
           4️⃣ MAJOR MATCH (10)
        ========================== */
        if (profile.major &&
            role.majors &&
            role.majors.includes(profile.major)) {
            totalScore += 10;
        }

        /* =========================
           5️⃣ WORK STYLE MATCH (10)
        ========================== */
        if (profile.workStyle === "Remote" && role.freelance) {
            totalScore += 10;
        }

        /* =========================
           6️⃣ FREELANCE BONUS (5)
        ========================== */
        if (profile.freelance && role.freelance) {
            totalScore += 5;
        }

        /* =========================
           7️⃣ TRENDING BOOST (5)
        ========================== */
        let trendingCategories = [
            "AI",
            "Cloud",
            "Cybersecurity",
            "Emerging Tech",
            "Data"
        ];

        let trending = false;

        if (trendingCategories.includes(role.category)) {
            totalScore += 5;
            trending = true;
        }

        /* =========================
           NORMALIZE SCORE
        ========================== */
        let finalScore = Math.min(Math.round(totalScore), 100);

        /* =========================
           SKILL GAP CALCULATION
        ========================== */
        let missingSkills = role.skills.filter(skill =>
            !profile.skills.some(userSkill =>
                userSkill.toLowerCase() === skill.toLowerCase()
            )
        );

        /* =========================
           PUSH ONLY RELEVANT ROLES
        ========================== */

        const minThreshold = profile.source === "Resume" ? 25 : 20;

        if (finalScore >= minThreshold) {

            results.push({
                role: roleName,
                score: finalScore,
                category: role.category,
                level: role.level,
                trending: trending,
                salaryINR: role.salaryINR,
                careerPath: role.careerPath,
                description: role.description,
                transitionTime: role.transitionTime,
                requiredSkills: role.requiredSkills,
                skillGapFocus: missingSkills.slice(0, 3),
                learningResources: role.learningResources,
                skills: role.skills
            });

        }

    }

    /* =========================
       SORT BY SCORE
    ========================== */

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 6);
}