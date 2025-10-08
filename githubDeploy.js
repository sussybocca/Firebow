document.getElementById('deploy').onclick = async () => {
    // --- Get token ---
    let token = localStorage.getItem("github-token");
    if (!token) {
        token = prompt("Enter your GitHub Access Token to deploy your project:");
        if (!token) return alert("GitHub token is required to deploy.");
        localStorage.setItem("github-token", token);
    }

    // --- Save current editor content ---
    files[currentFile] = editor.value;

    const repoName = `firebow-project-${Math.random().toString(36).slice(2,8)}`;
    const status = document.getElementById("deploy-status");
    status.textContent = "🛠️ Deploying to GitHub...";

    try {
        // 1️⃣ Create new repo
        const createRepoResp = await fetch("https://api.github.com/user/repos", {
            method: "POST",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: repoName, private: false })
        });

        const repoData = await createRepoResp.json();
        if (!createRepoResp.ok) throw new Error(repoData.message);

        // 2️⃣ Commit files
        for (const [path, content] of Object.entries(files)) {
            const commitResp = await fetch(`https://api.github.com/repos/${repoData.owner.login}/${repoName}/contents/${path}`, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `Add ${path}`,
                    content: b
