// netlifyDeploy.js

async function deployToNetlify(files, siteName) {
  const token = document.getElementById("netlify-token").value.trim();
  const status = document.getElementById("deploy-status");

  if (!token) {
    status.textContent = "⚠️ Please enter your Netlify Access Token.";
    return;
  }

  status.textContent = "🛠️ Deploying...";

  try {
    // 1️⃣ Create a new Netlify site
    const siteResponse = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: siteName || `firebow-${Math.random().toString(36).substr(2, 6)}`
      })
    });

    const siteData = await siteResponse.json();
    if (!siteResponse.ok) throw new Error(siteData.message);

    const siteId = siteData.site_id;
    const deployUrl = siteData.ssl_url;

    // 2️⃣ Upload files (HTML, CSS, JS)
    for (const [path, content] of Object.entries(files)) {
      const upload = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/files/${path}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain"
        },
        body: content
      });
      if (!upload.ok) throw new Error(`Upload failed for ${path}`);
    }

    status.innerHTML = `✅ Deployed successfully! <a href="${deployUrl}" target="_blank">${deployUrl}</a>`;
  } catch (err) {
    status.textContent = `❌ Error: ${err.message}`;
  }
}

// Example usage
document.getElementById("deploy-btn").addEventListener("click", async () => {
  const files = {
    "index.html": "<h1>Hello from Firebow!</h1>",
    "style.css": "body { font-family: sans-serif; }",
    "script.js": "console.log('Deployed from Firebow!');"
  };

  await deployToNetlify(files, "firebow-demo-site");
});