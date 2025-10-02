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

// --- Safe Netlify Deploy using Serverless Function ---
document.getElementById('deploy').onclick = async () => {
    if (!files["firebow.html"]) return alert("firebow.html is required!");

    try {
        const res = await fetch('/.netlify/functions/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files })
        });

        if (!res.ok) throw new Error('Deployment failed');

        const data = await res.json();
        alert(`Project deployed! URL: ${data.url}`);
    } catch (err) {
        console.error(err);
        alert("Deployment failed. Check console for errors.");
    }
};

// --- Initialize ---
renderFileList();
loadFile(currentFile);