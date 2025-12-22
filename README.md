# @lakshaykumar/rich-text-editor

A lightweight, modular, and **dependency-free** Rich Text Editor built with modern JavaScript (ES6+).

Designed for ease of use and performance, this editor provides a clean WYSIWYG experience without the bloat of heavy legacy libraries.

[**🔴 View Live Demo**](https://lakshaysharma684.github.io/rich-text-editor/)

## Features

- **Zero Dependencies**: Pure JavaScript, lightweight and fast.
- **Auto-Save**: Automatically saves content to LocalStorage to prevent data loss.
- **Slash Commands**: Type `/` to access a quick menu for headings, lists, media, and more.
- **Link Previews**: Hover over links to preview URLs, edit, or unlink.
- **Syntax Highlighting**: Basic code block highlighting for JavaScript/HTML.
- **Image Support**: Drag & Drop and Paste support (auto-converted to Base64).
- **Clean Output**: Generates semantic HTML5 output with optional **minification**.
- **Shared Styling**: Comes with a dedicated CSS file for Editor and Preview modes.
- **Modular Architecture**: Built with ES Modules for tree-shaking and maintainability.

## Installation & Usage

Choose the method that best fits your project.

### Method 1: NPM (Recommended for Bundlers)
Ideal for modern projects using Webpack, Vite, Parcel, or Rollup.

1. **Install the package:**
   ```bash
   npm install @lakshaykumar/rich-text-editor
   ```

2. **Usage in your project (e.g., React/Vue/Vanilla JS):**
   ```javascript
   // 1. Import the Editor Class
   import RichTextEditor from '@lakshaykumar/rich-text-editor';
   
   // 2. Import the Styles
   import '@lakshaykumar/rich-text-editor/src/styles/rte.css';
   
   // 3. Initialize on a container
   const editor = new RichTextEditor('#my-editor', {
       placeholder: 'Start writing...'
   });
   ```

---

### Method 2: CDN (Fastest, No Build)
Use the editor directly in the browser via `unpkg` or `jsDelivr`.

**Full HTML Example:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rich Text Editor - CDN Demo</title>
    <!-- Import Styles -->
    <link rel="stylesheet" href="https://unpkg.com/@lakshaykumar/rich-text-editor@latest/src/styles/rte.css">
    <style>
        body { font-family: sans-serif; padding: 20px; }
    </style>
</head>
<body>

    <h1>My Editor</h1>
    <div id="editor-container"></div>

    <!-- Import Library -->
    <script src="https://unpkg.com/@lakshaykumar/rich-text-editor@latest/dist/rich-text-editor.min.js"></script>

    <script>
        // Initialize the editor
        const editor = new RichTextEditor('#editor-container', {
            placeholder: 'Type something amazing...'
        });
    </script>
</body>
</html>
```

---

### Method 3: Direct Download (Offline / No NPM)
Manually download the files and host them locally.

1. **Download** the `dist/` folder and `src/styles/` form this repository.
2. **Structure:**
   ```
   /my-project
     /libs
       /rich-text-editor
         /dist
           rich-text-editor.min.js
         /styles
           rte.css
     index.html
   ```
3. **Usage:**
   ```html
   <link rel="stylesheet" href="libs/rich-text-editor/styles/rte.css">
   <script src="libs/rich-text-editor/dist/rich-text-editor.min.js"></script>

   <div id="editor"></div>

   <script>
       const editor = new RichTextEditor('#editor');
   </script>
   ```

---

## Configuration & API

### Initialization Options
```javascript
const editor = new RichTextEditor('#target', {
    placeholder: 'Start typing...', // Placeholder text
    enableAutoSave: true,           // Persist data to localStorage
    autoSaveKey: 'unique-id'        // Key for localStorage (default: URL + Selector)
});
```

### Methods
```javascript
// Get HTML Content
const html = editor.getHTML();

// Get Minified HTML (removes comments/whitespace)
const minified = editor.getHTML(true);

// Set HTML Content
editor.setHTML('<p>New content...</p>');

// Clear Editor
editor.clear();
```
## Structure
```
rich-text-editor/
├── src/
│   ├── editor/          # Core Logic
│   └── styles/          # Styling
├── demo-editor.html     # Local Demo
└── README.md
```

## License & Attribution

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this software in any project, commercial or personal. Use of this software requires preservation of the copyright notice and attribution to the original author, **Lakshay Kumar**.

**Reference for Import:**
When using this package, please keep the package namespace `@lakshaysharma684/rich-text-editor` to ensure proper credit is maintained.

```javascript
import RichTextEditor from '@lakshaykumar/rich-text-editor';
```
