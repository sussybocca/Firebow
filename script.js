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
        li.onclick = () => loadFile(filename);
        filesList.appendChild(li);
    }
}

function loadFile(filename) {
    currentFile = filename;
    editor.value = files[filename];
    updatePreview();
}

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

function updatePreview() {
    if (!files["firebow.html"]) return;
    const blob = new Blob([files["firebow.html"]], {type: 'text/html'});
    previewFrame.src = URL.createObjectURL(blob);
}

editor.addEventListener('input', () => {
    files[currentFile] = editor.value;
    updatePreview();
});

// --- Safe Netlify Deploy ---
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

// --- Export for Python IDE ---
document.getElementById('export-python').onclick = async () => {
    const zip = new JSZip();
    for (const filename in files) zip.file(filename, files[filename]);

    const requirements = [
        "spyder",
        "black",
        "ruff",
        "pylint",
        "ipython",
        "jupyter",
        "spyder-kernels"
    ].join("\n");
    zip.file("requirements.txt", requirements);

    const readme = `# Firebow Python Project Export

Open in Python IDE:

1. Install requirements:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Open in Spyder or Jupyter:
\`\`\`bash
spyder .
jupyter notebook
\`\`\`

3. Use Black, Ruff, Pylint for Python formatting/linting.
`;
    zip.file("README.md", readme);

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "firebow_python_project.zip";
    link.click();
    alert("Project exported for Python IDE!");
};

renderFileList();
loadFile(currentFile);
