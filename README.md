# @lakshaykumar/rich-text-editor

A lightweight, modular, and **dependency-free** Rich Text Editor platform built with modern JavaScript (ES6+). Optimized for performance, accessibility, and professional-grade extensibility.

[**🔴 View Live Demo**](https://lakshaysharma684.github.io/rich-text-editor/)

---

## 🚀 Key Features at a Glance

### 🛠️ Extensible Platform
- **Custom Plugin System**: Register your own commands and buttons easily.
- **Custom Context Menu**: Fully configurable right-click menu with support for icons, labels, and dividers.
- **Advanced Command Registry**: Dynamically bind logic to standard or custom commands.

### 📋 Professional Editing
- **Interactive Table Resizer**: Drag-to-resize columns visually with real-time feedback.
- **Image Pro-Handling**: Preset alignments (Left, Center, Right, Full) and aspect ratio locking (hold `Shift`).
- **Markdown Shortcuts**: Real-time transformation of `**bold**`, `_italic_`, `` `code` ``, and `[links](url)`.
- **Slash Commands**: Type `/` to access a quick-insert menu for media, headings, and formatting.

### ⚡ Performance & UX
- **Zero Dependencies**: Lightweight footprint, no external libraries required.
- **Full-Width Wrapping Toolbar**: Zero-dropdown design—all tools are visible at once and wrap gracefully on any screen size.
- **Smart Status Bar**: Detailed real-time stats including Word, Character, and Line counts + Selection info.
- **Auto-Save (Optional)**: Optional local persistence to prevent data loss across sessions.

---

## 📦 Installation

```bash
npm install @lakshaykumar/rich-text-editor
```

---

## 🛠️ Getting Started

### 1. Basic Setup
```javascript
import RichTextEditor from '@lakshaykumar/rich-text-editor';
import '@lakshaykumar/rich-text-editor/src/styles/rte.css';

const editor = new RichTextEditor('#editor-container', {
    placeholder: 'Start writing...',
    enableAutoSave: true // Now disabled by default (false)
});
```

### 2. Custom Buttons & Commands
Add your own tools to the toolbar seamlessly:
```javascript
const editor = new RichTextEditor('#editor', {
    customButtons: [
        {
            label: '🎁',
            title: 'Insert Gift',
            command: 'insertGift',
            action: (editor) => {
                editor.handleCommand('insertHTML', '🎁');
            }
        }
    ]
});

// Or register a command separately
editor.registerCommand('insertGift', (editor) => {
    editor.handleCommand('insertHTML', '🎁');
});
```

### 3. Custom Context Menu
Configure what users see when they right-click:
```javascript
const editor = new RichTextEditor('#editor', {
    contextMenuItems: [
        { label: 'Insert Star ⭐', icon: '⭐', action: (editor) => editor.handleCommand('insertHTML', '⭐') },
        { label: 'Insert Check ✅', icon: '✅', action: (editor) => editor.handleCommand('insertHTML', '✅') },
        { type: 'divider' },
        { label: 'Clear All', icon: '🧹', action: (editor) => editor.clear() }
    ]
});
```

---

## ⌨️ Shortcuts & Commands

### Inline Markdown
Type these patterns followed by a `Space` to trigger instant transformation:
- `# ` H1 / `## ` H2 / `### ` H3
- `> ` Blockquote
- `- ` Bullet List / `1. ` Numbered List
- `**bold** ` → **bold**
- `_italic_ ` → *italic*
- `` `code` `` → `inline code`
- `[Label](URL) ` → [Link]

### Keyboard Shortcuts
- `Ctrl+K` / `Cmd+K`: Open Link Picker
- `Alt + 1` to `Alt + 6`: Headings (H1-H6)
- `Alt + 0`: Paragraph
- `Ctrl+Shift+V`: Paste as Plain Text
- `Shift + Drag Image`: Lock aspect ratio while resizing

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `placeholder` | `String` | `'Start typing...'` | Text shown when editor is empty |
| `enableAutoSave` | `Boolean` | `false` | Enable/Disable local storage persistence |
| `autoSaveKey` | `String` | `null` | Custom local storage key (auto-generated if null) |
| `customButtons` | `Array` | `[]` | List of custom button objects to add to toolbar |
| `contextMenuItems`| `Array` | `[]` | List of custom items for the right-click menu |

---

## 🛠️ API Methods

- `editor.getHTML(minify = false)`: Returns the current HTML content of the editor.
- `editor.setHTML(html)`: Sets the HTML content and updates the view.
- `editor.clear()`: Resets the editor and clears any cached auto-save data.
- `editor.handleCommand(cmd, value)`: Executes a standard or custom command.
- `editor.updateStats()`: Forces a refresh of the status bar (useful after manual DOM edits).
- `editor.registerCommand(name, callback)`: Adds new logic to the editor's command registry.

---

## 🔗 Links & Resources
- **NPM Project**: [@lakshaykumar/rich-text-editor](https://www.npmjs.com/package/@lakshaykumar/rich-text-editor)
- **Report Bugs**: [GitHub Issues](https://github.com/lakshaysharma684/rich-text-editor/issues)

Developed with ❤️ by **Lakshay Kumar**. Licensed under MIT.
