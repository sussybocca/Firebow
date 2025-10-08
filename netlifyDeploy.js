const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { files, token } = JSON.parse(event.body);

    if (!token) return { statusCode: 400, body: "Missing token" };

    // 1️⃣ Create new site
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

    // 2️⃣ Upload all files
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

    return {
      statusCode: 200,
      body: JSON.stringify({ url: deployUrl })
    };

  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
