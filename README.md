# @lakshaykumar/rich-text-editor

A lightweight, modular, and **dependency-free** Rich Text Editor built with modern JavaScript (ES6+).

Designed for ease of use and performance, this editor provides a clean WYSIWYG experience without the bloat of heavy legacy libraries.

## Features

- **Zero Dependencies**: Pure JavaScript, lightweight and fast.
- **Image Support**: Drag & Drop and Paste support (auto-converted to Base64).
- **Clean Output**: Generates semantic HTML5 output.
- **Shared Styling**: Comes with a dedicated CSS file for Editor and Preview modes.
- **Modular Architecture**: Built with ES Modules for tree-shaking and maintainability.

## Installation

You can install the package via npm:

```bash
npm install @lakshaykumar/rich-text-editor
```

## Usage

### 1. Import the CSS
Start by including the core styles. You can import them in your JS (if your bundler supports it) or include it in your HTML.

**In JavaScript/React/Vue:**
```javascript
import '@lakshaykumar/rich-text-editor/src/styles/rte.css';
```

**In HTML:**
```html
<link rel="stylesheet" href="./node_modules/@lakshaykumar/rich-text-editor/src/styles/rte.css">
```

### 2. Initialize the Editor
Import the `RichTextEditor` class and initialize it on a target element.

```javascript
import RichTextEditor from '@lakshaykumar/rich-text-editor';

// Initialize with a selector or DOM element
const editor = new RichTextEditor('#my-editor-container', {
    placeholder: 'Start writing your masterpiece...'
});
```

### 3. Get the HTML Content
To retrieve the content (e.g., for saving to a database):
```javascript
const html = editor.getHTML();
console.log(html);
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
