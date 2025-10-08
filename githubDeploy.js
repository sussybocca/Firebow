// --- GitHub Login ---
document.getElementById("github-login").onclick = () => {
    const token = document.getElementById("github-token").value.trim();
    const status = document.getElementById("login-status");

    if (!token) return alert("Please enter your GitHub token.");

    localStorage.setItem("github-token", token);
    status.textContent = "✅ GitHub token saved! You can now deploy your site.";
};

// --- Deploy to GitHub ---
document.getElementById('deploy').onclick = async () => {
    const token = localStorage.getItem("github-token");
    const status = document.getElementById("deploy-status");
    if (!token) return alert("Login with GitHub first.");

    files[currentFile] = editor.value;

    const repoName = `firebow-project-${Math.random().toString(36).slice(2,8)}`;
    status.textContent = "🛠️ Creating repo and uploading files...";

    try {
        // 1️⃣ Create new repo
        const createRepoResp = await fetch("https://api.github.com/user/repos", {
            method: "POST",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: repoName,
                private: false
            })
        });

        const repoData = await createRepoResp.json();
        if (!createRepoResp.ok) throw new Error(repoData.message);

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
            if (!commitResp.ok) throw new Error(commitData.message);
        }

        status.innerHTML = `✅ Repo created! <a href="https://github.com/${repoData.owner.login}/${repoName}" target="_blank">View on GitHub</a>`;

    } catch (err) {
        console.error(err);
        status.textContent = `❌ Deployment failed: ${err.message}`;
    }
};
