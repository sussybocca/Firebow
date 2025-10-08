// --- Firebow Files ---
let files = JSON.parse(localStorage.getItem('firebow-files')) || {
    "firebow.html": "<!DOCTYPE html><html><head><title>Firebow</title></head><body><h1>Welcome to Firebow</h1></body></html>",
    "style.css": "body { font-family: Arial; }",
    "script.js": "console.log('Hello Firebow');"
};

let currentFile = Object.keys(files)[0];
const filesList = document.getElementById('files');
const editor = document.getElementById('editor');
const previewFrame = document.getElementById('preview-frame');

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

function loadFile(filename) {
    currentFile = filename;
    editor.value = files[filename];
    updatePreview();
}

// --- Save / Add / Delete / Rename ---
document.getElementById('save-file').onclick = () => {
    files[currentFile] = editor.value;
    localStorage.setItem('firebow-files', JSON.stringify(files));
    updatePreview();
    alert(`${currentFile} saved!`);
};

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

renderFileList();
loadFile(currentFile);
