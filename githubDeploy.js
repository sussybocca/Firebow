document.getElementById('deploy').onclick = async () => {
    const status = document.getElementById("deploy-status");

    // --- Always prompt for token ---
    const token = prompt("Enter your GitHub Access Token to deploy your project:");
    if (!token) {
        alert("GitHub token is required to deploy.");
        return;
    }

    // --- Save current editor content ---
    files[currentFile] = editor.value;

    const repoName = `firebow-project-${Math.random().toString(36).slice(2,8)}`;
    status.textContent = "🛠️ Deploying to GitHub...";

    try {
        // 1️⃣ Create a new repo
        const createRepoResp = await fetch("https://api.github.com/user/repos", {
            method: "POST",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: repoName, private: false })
        });

        const repoData = await createRepoResp.json();
        if (!createRepoResp.ok) throw new Error(createRepoResp.status + ": " + (repoData.message || "Unknown error"));

        // 2️⃣ Upload files
        for (const [path, content] of Object.entries(files)) {
            const commitResp = await fetch(`https://api.github.com/repos/${repoData.owner.login}/${repoName}/contents/${path}`, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `Add ${path}`,
                    content: btoa(unescape(encodeURIComponent(content)))
                })
            });

            const commitData = await commitResp.json();
            if (!commitResp.ok) throw new Error(commitResp.status + ": " + (commitData.message || "Commit failed"));
        }

        status.innerHTML = `✅ Project deployed! <a href="https://github.com/${repoData.owner.login}/${repoName}" target="_blank">View on GitHub</a>`;

    } catch (err) {
        console.error(err);
        status.textContent = `❌ Deployment failed: ${err.message}`;
    }
};
