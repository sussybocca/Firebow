const fetch = require('node-fetch');
const JSZip = require('jszip');

exports.handler = async (event) => {
    try {
        const { files } = JSON.parse(event.body);
        const zip = new JSZip();
        for (const filename in files) zip.file(filename, files[filename]);
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
        const projectName = `firebow-${Date.now()}`;

        const siteRes = await fetch('https://api.netlify.com/api/v1/sites', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: projectName })
        });
        const site = await siteRes.json();

        await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` },
            body: zipBuffer
        });

        return { statusCode: 200, body: JSON.stringify({ url: site.ssl_url || site.url }) };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: 'Deployment failed' };
    }
};
