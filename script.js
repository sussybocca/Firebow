document.getElementById('deploy').onclick = async () => {
    const token = localStorage.getItem("netlify-token");
    if (!token) return alert("Please login with Netlify first.");

    // Save current editor content
    files[currentFile] = editor.value;

    try {
        const res = await fetch('/.netlify/functions/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files, token })
        });

        if (!res.ok) throw new Error("Deployment failed");

        const data = await res.json();
        alert(`Project deployed! URL: ${data.url}`);
    } catch (err) {
        console.error(err);
        alert(`Deployment failed: ${err.message}`);
    }
};
