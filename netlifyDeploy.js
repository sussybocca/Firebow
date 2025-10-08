// --- Netlify OAuth Login ---
document.getElementById("netlify-login").onclick = () => {
    const clientId = "uGQtWR4ysLmkuAR-KJ-ei4LT_FMdtZ_fhzZ5-a78RCM";
    const url = `https://app.netlify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
    window.open(url, "_blank");
};

document.getElementById("submit-oauth").onclick = async () => {
    const code = document.getElementById("oauth-code").value.trim();
    const status = document.getElementById("login-status");
    if (!code) return alert("Paste the code from Netlify.");

    try {
        const clientId = "uGQtWR4ysLmkuAR-KJ-ei4LT_FMdtZ_fhzZ5-a78RCM";
        const clientSecret = "81dMQl_enqBalvLTiPDgKvODw2HgmenP246dIxaaXWM";

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
        });

        const res = await fetch("https://api.netlify.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString()
        });

        if (!res.ok) throw new Error("Failed to exchange code for token");

        const data = await res.json();
        localStorage.setItem("netlify-token", data.access_token);
        status.textContent = "✅ Logged in! Token saved locally.";
    } catch (err) {
        console.error(err);
        status.textContent = `❌ OAuth error: ${err.message}`;
    }
};

// --- Deploy using token ---
async function deployToNetlify(files) {
    const token = localStorage.getItem("netlify-token");
    const status = document.getElementById("deploy-status");
    if (!token) return alert("Login with Netlify first.");

    status.textContent = "🛠️ Deploying...";

    try {
        // Create site
        const siteResp = await fetch("https://api.netlify.com/api/v1/sites", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: `firebow-${Math.random().toString(36).slice(2,8)}`
            })
        });

        const siteData = await siteResp.json();
        if (!siteResp.ok) throw new Error(siteData.message || "Site creation failed");

        const siteId = siteData.site_id;
        const deployUrl = siteData.ssl_url || siteData.url;

        // Upload all files
        for (const [path, content] of Object.entries(files)) {
            const uploadResp = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/files/${path}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "text/plain"
                },
                body: content
            });

            if (!uploadResp.ok) {
                const errText = await uploadResp.text();
                throw new Error(`Upload failed for ${path}: ${errText}`);
            }
        }

        status.innerHTML = `✅ Deployed successfully! <a href="${deployUrl}" target="_blank">${deployUrl}</a>`;
    } catch (err) {
        console.error(err);
        status.textContent = `❌ Deployment error: ${err.message}`;
    }
}

// Hook deploy button
document.getElementById('deploy').onclick = () => {
    files[currentFile] = editor.value;
    deployToNetlify(files);
};
