# @lakshaykumar/rich-text-editor

A lightweight, modular, and **dependency-free** Rich Text Editor built with modern JavaScript (ES6+).

[**🔴 View Live Demo (v1.4.1)**](https://lakshaysharma684.github.io/rich-text-editor/)

## What's New in v1.4.1 🚀
This major update transforms the library into an extensible platform:
- **Custom Plugin & Command System**: Add your own buttons and commands to the toolbar without modifying the core library.
- **Interactive Table Resizer**: Professional-grade table column resizing with visual handles.
- **Advanced Markdown Shortcuts**: Support for inline patterns like `**bold**`, `_italic_`, `` `code` ``, and `[links](url)`.
- **Mobile Responsive Toolbar**: Intelligent overflow menu ("...") for smaller screens.
- **Pro Image Handling**: Aspect ratio locking (hold `Shift`) and alignment presets (Left, Center, Right, Full).
- **Accessibility (A11y)**: Full ARIA labels, `role="textbox"` support, and standardized keyboard navigation.

## Core Features
- **Zero Dependencies**: Pure JavaScript, lightweight and fast.
- **Slash Commands**: Type `/` to access a quick menu for headings, lists, media, and more.
- **Link Previews**: Hover over links to preview URLs, edit, or unlink.
- **Syntax Highlighting**: Basic code block highlighting for JavaScript/HTML.
- **Export Options**: Built-in support to export content as **Markdown** or **PDF**.
- **AutoSave**: Robust local storage persistence with "Unsaved Draft" recovery.

## Installation & Usage

### Method 1: NPM (Recommended)
```bash
npm install @lakshaykumar/rich-text-editor
```

```javascript
import RichTextEditor from '@lakshaykumar/rich-text-editor';
import '@lakshaykumar/rich-text-editor/src/styles/rte.css';

const editor = new RichTextEditor('#my-editor', {
    placeholder: 'Start writing...',
    customButtons: [
        {
            label: '🎁',
            title: 'Insert Product',
            command: 'insertProduct',
            action: (editor) => {
                const id = prompt("Product ID:");
                if (id) editor.handleCommand('insertHTML', `<div class="product-embed">Product ${id}</div>`);
            }
        }
    ]
});
```

### Method 2: CDN
```html
<link rel="stylesheet" href="https://unpkg.com/@lakshaykumar/rich-text-editor@latest/src/styles/rte.css">
<script src="https://unpkg.com/@lakshaykumar/rich-text-editor@latest/dist/rich-text-editor.min.js"></script>

<script>
    const editor = new RichTextEditor('#editor-container');
</script>
```

## Advanced Features

### Custom Plugins
You can register global commands or add ad-hoc buttons:
```javascript
const editor = new RichTextEditor('#target', {
    customButtons: [{ label: '⭐', title: 'Featured', command: 'markFeatured' }]
});

// Register the logic for your command
editor.registerCommand('markFeatured', (editor, value, target) => {
    alert('Marked as featured!');
});
```

### Keyboard Shortcuts
- `Ctrl+K` / `Cmd+K`: Open Link Picker
- `Alt+1` to `Alt+6`: Headings (H1-H6)
- `Alt+0`: Paragraph
- `Ctrl+Enter`: Exit blockquote or list

### Markdown Shortcuts
Type these followed by a `Space` to trigger:
- `# ` H1 / `## ` H2
- `> ` Blockquote
- `**bold** ` → **bold**
- `_italic_ ` → *italic*
- `` `code` `` → `code`
- `[Label](URL) ` → [Link]

## Methods & API
- `editor.getHTML(minify = false)`: Get content.
- `editor.setHTML(html)`: Set content.
- `editor.clear()`: Reset editor.
- `editor.registerCommand(name, callback)`: Add custom logic.

## License & Attribution
MIT License. Created by **Lakshay Kumar**. Please maintain attribution to `@lakshaykumar/rich-text-editor` in your projects.
