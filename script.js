// --- Firebow Platform ---
let files = JSON.parse(localStorage.getItem('firebow-files')) || {
    "firebow.html": "<!DOCTYPE html><html><head><title>Firebow</title></head><body><h1>Welcome to Firebow</h1></body></html>",
    "style.css": "body { font-family: Arial; }",
    "script.js": "console.log('Hello Firebow');"
};

let currentFile = Object.keys(files)[0];

const filesList = document.getElementById('files');
const editor = document.getElementById('editor');
const previewFrame = document.getElementById('preview-frame');

// --- Render Files ---
function renderFileList() {
    filesList.innerHTML = '';
    for (let filename in files) {
        const li = document.createElement('li');
        li.textContent = filename;
        li.dataset.filename = filename;
        li.dataset.content = files[filename];
        li.onclick = () => loadFile(filename);
        filesList.appendChild(li);
    }
}

// --- Load File ---
function loadFile(filename) {
    currentFile = filename;
    editor.value = files[filename];
    updatePreview();
}

// --- Save File ---
document.getElementById('save-file').onclick = () => {
    files[currentFile] = editor.value;
    localStorage.setItem('firebow-files', JSON.stringify(files));
    updatePreview();
    alert(`${currentFile} saved!`);
};

// --- Add / Delete / Rename File ---
document.getElementById('add-file').onclick = () => {
    const filename = prompt('Enter new file name:');
    if (filename && !files[filename]) {
        files[filename] = '';
        renderFileList();
    }
};

document.getElementById('delete-file').onclick = () => {
    if (confirm(`Delete ${currentFile}?`)) {
        delete files[currentFile];
        const remaining = Object.keys(files)[0];
        currentFile = remaining;
        renderFileList();
        loadFile(currentFile);
    }
};

document.getElementById('rename-file').onclick = () => {
    const newName = prompt('Enter new name for the file:', currentFile);
    if (newName && !files[newName]) {
        files[newName] = files[currentFile];
        delete files[currentFile];
        currentFile = newName;
        renderFileList();
        loadFile(currentFile);
    }
};

// --- Live Preview ---
function updatePreview() {
    if (!files["firebow.html"]) return;
    const blob = new Blob([files["firebow.html"]], {type: 'text/html'});
    previewFrame.src = URL.createObjectURL(blob);
}

editor.addEventListener('input', () => {
    files[currentFile] = editor.value;
    updatePreview();
});

// --- Safe Frontend Netlify Deploy ---
async function deployToNetlify(files) {
    const token = document.getElementById("netlify-token").value.trim();
    if (!token) return alert("Please enter your Netlify Access Token!");

    const status = document.getElementById("deploy-status");
    status.textContent = "🛠️ Deploying...";

    try {
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

        status.innerHTML = `✅ Deployed successfully! <a href="${deployUrl}" target="_blank">${deployUrl}</a>`;
    } catch (err) {
        console.error(err);
        status.textContent = `❌ Deployment error: ${err.message}`;
    }
}

// --- Deploy Button ---
document.getElementById('deploy').onclick = () => {
    // Save current editor content before deploying
    files[currentFile] = editor.value;
    deployToNetlify(files);
};

// --- Initialize ---
renderFileList();
loadFile(currentFile);