# Firebow Platform

Firebow is a browser-based front-end coding platform that allows users to:

- Edit HTML, CSS, JS files in-browser
- Preview changes live
- Save projects to localStorage
- Deploy HTML projects safely to Netlify using serverless functions
- Optionally export Python projects for IDEs like Spyder or Jupyter

---

## How to Use

### Browser Front-End

1. Open `index.html` in a browser.
2. Use the sidebar to manage files (add, delete, rename, save).
3. Edit your code in the editor.
4. Click **Preview** to see live changes.
5. Click **Deploy** to publish the project on Netlify (token stored safely in a serverless function).

---

### Python IDE (Optional)

You can export your project for Python IDE support:

1. Click **Export for Python IDE** in the sidebar.
2. Download the ZIP file. It includes:
   - All project files
   - `requirements.txt` with optional Python extensions
   - `README.md` with instructions

3. Extract ZIP locally.

4. Install required Python extensions:
```bash
pip install -r requirements.txt
