# @lakshaykumar/rich-text-editor

A **lightweight, zero-dependency** Rich Text Editor platform built with modern JavaScript (ES6+ modules). Optimized for performance, accessibility, and professional-grade extensibility.

[![npm version](https://img.shields.io/npm/v/@lakshaykumar/rich-text-editor.svg)](https://www.npmjs.com/package/@lakshaykumar/rich-text-editor)
[![license](https://img.shields.io/npm/l/@lakshaykumar/rich-text-editor.svg)](LICENSE)

[**Live Demo**](https://lakshaysharma684.github.io/rich-text-editor/) · [**Advanced Demo**](https://lakshaysharma684.github.io/rich-text-editor/demo-editor.html) · [**NPM**](https://www.npmjs.com/package/@lakshaykumar/rich-text-editor)

---

## Features

### Toolbar & Formatting
- Full formatting toolbar: bold, italic, underline, strikethrough, headings (H1–H6), paragraph, font family, font size, text color, background color, alignment (left/center/right), indent/outdent, bullet list, numbered list, blockquote, code block, horizontal rule
- **`toolbarItems`** — restrict visible buttons per-editor (v1.5.0). Pass an array of command strings; only those buttons render. Separators auto-collapse.
- All buttons always visible — multi-line wrapping toolbar, no hidden overflow menus
- Active state highlighting for toggled commands (bold, headings, alignment, etc.)

### Dark Mode & Theming
- **System dark mode** (v1.5.0) — auto-detects `prefers-color-scheme: dark` on init, syncs live as OS changes. Once user manually toggles, auto-sync stops.
- Manual toggle via 🌙/☀️ toolbar button
- `.rte-dark-mode` — force dark. `.rte-light-mode` — force light (overrides system pref)
- Full CSS custom property architecture — easy to override at host level

### Rich Content
- **Tables** — insert via grid picker, drag-to-resize columns
- **Images** — drag & drop, click to upload, `onImageUpload` callback for server upload, alignment presets (left/center/right/full), aspect-ratio locking (hold `Shift` while resizing)
- **Links** — modal link picker with URL, display text, open-in-new-tab; hover tooltip with edit/copy/open
- **Video** — embed YouTube/Vimeo via URL
- **Emoji** — emoji picker panel
- **Code blocks** — syntax highlighting for JS/HTML/CSS keywords

### Smart Input
- **Markdown shortcuts** — real-time inline transformation: `**bold**`, `_italic_`, `` `code` ``, `[label](url)`, `# ` → H1, `> ` → blockquote, `- ` → list, `1. ` → ordered list
- **Slash menu** — type `/` for quick-insert command palette (headings, table, image, lists, code, quote, hr)
- **Floating selection menu** — appears on text selection for quick bold/italic/link/code formatting
- **Paste sanitizer** — strips dangerous tags and layout-breaking styles from Word/Google Docs pastes; preserves semantic formatting

### Developer Tools
- **Custom plugin system** — `customButtons` in options + `registerCommand()` API
- **Custom context menu** — configurable right-click menu with icons, labels, dividers
- **Source view** — toggle HTML source editing
- **Search & Replace** — find/replace with match count and highlight
- **Export** — HTML→Markdown (Turndown CDN), PDF (html2pdf CDN)
- **Import** — `.docx` → HTML (Mammoth CDN, loads on demand)
- **Auto-save** — optional debounced localStorage persistence with restore-draft banner
- **Fullscreen mode** — distraction-free editing, content centered at 860px max-width
- **Status bar** — live word count, char count, line count, selection info

### Accessibility
- `role="textbox"`, `aria-multiline`, `aria-label` on all toolbar controls
- Full keyboard navigation

---

## Installation

```bash
npm install @lakshaykumar/rich-text-editor
```

### CDN (no bundler)
```html
<link rel="stylesheet" href="https://unpkg.com/@lakshaykumar/rich-text-editor/dist/rte.min.css">
<script src="https://unpkg.com/@lakshaykumar/rich-text-editor/dist/rich-text-editor.min.js"></script>
<!-- window.RichTextEditor is available globally -->
```

---

## Quick Start

```javascript
import RichTextEditor from '@lakshaykumar/rich-text-editor';
import '@lakshaykumar/rich-text-editor/style';

const editor = new RichTextEditor('#editor', {
    placeholder: 'Start writing...'
});
```

---

## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `String` | `'Start typing...'` | Shown when editor is empty |
| `enableAutoSave` | `Boolean` | `false` | Enable localStorage persistence |
| `autoSaveKey` | `String` | `null` | Custom storage key (auto-generated if null) |
| `customButtons` | `Array` | `[]` | Extra toolbar buttons — `{ id, label, command, title? }` |
| `contextMenuItems` | `Array` | `[]` | Right-click menu items — `{ label, icon, action }` or `{ type: 'divider' }` |
| `toolbarItems` | `Array\|null` | `null` | Allowlist of visible button commands. `null` = show all |
| `onImageUpload` | `Function` | `null` | `async (file) => url` — upload images to your server |

### `toolbarItems` command reference

| Command | Button |
|---|---|
| `undo` / `redo` | Undo / Redo |
| `fontName` | Font family select |
| `customFontSize` | Font size select |
| `formatBlock` | H1, H2, Blockquote, Code block (use with `value`) |
| `bold` / `italic` / `underline` / `strikeThrough` | B / I / U / S |
| `foreColor` / `hiliteColor` | Text color / Background color |
| `insertUnorderedList` / `insertOrderedList` | Bullet / Numbered list |
| `justifyLeft` / `justifyCenter` / `justifyRight` | Alignment |
| `indent` / `outdent` | Indent / Outdent |
| `createLink` | Link picker |
| `insertEmoji` | Emoji picker |
| `customImage` | Image insert |
| `insertVideo` | Video embed |
| `customImport` | Word import |
| `insertTable` | Table picker |
| `insertHorizontalRule` | Horizontal rule |
| `removeFormat` | Clear formatting |
| `exportMarkdown` / `exportPDF` | Export (shown via Export dropdown) |
| `toggleSearch` | Find & Replace |
| `toggleTheme` | Dark mode toggle |
| `toggleSource` | Source view |
| `toggleFullScreen` | Fullscreen |

---

## Usage Examples

### Restrict toolbar to basic formatting
```javascript
new RichTextEditor('#indications-rte', {
    toolbarItems: [
        'bold', 'italic', 'underline',
        'insertUnorderedList', 'insertOrderedList',
        'removeFormat'
    ]
});
```

### Full-featured editor with custom commands
```javascript
const editor = new RichTextEditor('#blog-editor', {
    placeholder: 'Start writing...',
    enableAutoSave: true,
    autoSaveKey: 'blog-draft',
    customButtons: [
        { label: '🚀', title: 'Insert Rocket', command: 'insertRocket' }
    ],
    contextMenuItems: [
        { label: 'Insert Star ⭐', icon: '⭐', action: (ed) => ed.handleCommand('insertHTML', '⭐') },
        { type: 'divider' },
        { label: 'Clear', icon: '🧹', action: (ed) => ed.clear() }
    ]
});

editor.registerCommand('insertRocket', (ed) => {
    ed.handleCommand('insertHTML', '🚀');
});
```

### Server image upload
```javascript
const editor = new RichTextEditor('#editor', {
    onImageUpload: async (file) => {
        const form = new FormData();
        form.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const data = await res.json();
        return data.url;
    }
});
```

### Force dark or light mode
```javascript
// Force dark regardless of OS pref
document.querySelector('.rte-wrapper').classList.add('rte-dark-mode');

// Force light regardless of OS pref
document.querySelector('.rte-wrapper').classList.add('rte-light-mode');
```

---

## API Methods

| Method | Description |
|---|---|
| `editor.getHTML(minify?)` | Returns editor innerHTML. Pass `true` to minify (collapses whitespace, strips comments) |
| `editor.setHTML(html)` | Sets editor content |
| `editor.clear()` | Empties editor |
| `editor.handleCommand(cmd, value?, target?)` | Executes a built-in or registered command |
| `editor.registerCommand(name, fn)` | Registers a custom command: `fn(editor, value, target)` |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd+K` | Open link picker |
| `Ctrl/Cmd+B` | Bold |
| `Ctrl/Cmd+I` | Italic |
| `Ctrl/Cmd+U` | Underline |
| `Ctrl/Cmd+Z` / `Y` | Undo / Redo |
| `Alt+1` – `Alt+6` | H1 – H6 |
| `Alt+0` | Paragraph |
| `Ctrl/Cmd+Enter` | Exit blockquote or list |
| `Ctrl/Cmd+Shift+V` | Paste as plain text |
| `Shift+drag image` | Resize image with aspect ratio locked |
| `/` | Open slash command palette |

---

## Markdown Shortcuts

Type these inline — transformation triggers on the trailing space:

| Type | Result |
|---|---|
| `# ` / `## ` / `### ` | H1 / H2 / H3 |
| `> ` | Blockquote |
| `- ` or `* ` | Bullet list |
| `1. ` | Numbered list |
| `**text**` | **Bold** |
| `_text_` | *Italic* |
| `` `text` `` | Inline code |
| `[label](url)` | Link |
| `---` | Horizontal rule |

---

## Architecture

Zero-dependency ES module. Entry: `src/editor/RichTextEditor.js`. Build → `dist/` via esbuild.

`RichTextEditor` is the orchestrator — instantiates and coordinates 19 feature modules:

```
src/editor/
  RichTextEditor.js      ← main class, public API, module init
  Toolbar.js             ← renders buttons, toolbarItems filter, handleCommand dispatch
  MarkdownShortcuts.js   ← real-time inline/block markdown conversion
  PasteSanitizer.js      ← strips dangerous tags/styles on paste
  ImageHandler.js        ← drag-drop + upload callback
  ImageResizer.js        ← Shift+drag aspect-ratio locking, alignment presets
  TableResizer.js        ← drag-to-resize column widths
  SlashMenu.js           ← / command palette
  FloatingMenu.js        ← selection-based formatting popover
  ContextMenu.js         ← right-click menu
  LinkPicker.js          ← modal URL insert
  LinkTooltip.js         ← hover link editor
  EmojiPicker.js
  TablePicker.js
  SearchReplace.js
  CodeHighlighter.js
  AutoSave.js            ← debounced localStorage persistence
  FileImporter.js        ← .docx → HTML via Mammoth CDN
  Exporter.js            ← HTML → Markdown (Turndown CDN) / PDF (html2pdf CDN)

src/styles/rte.css       ← all styles, CSS custom properties, system dark mode
src/wrapper.js           ← IIFE global export for non-npm usage
```

### External Libraries (CDN, loaded on demand)
- **Mammoth.js** — Word `.docx` import (`FileImporter`)
- **Turndown** — HTML → Markdown export (`Exporter`)
- **html2pdf.js** — PDF export (`Exporter`)

None are bundled — they load only when those features are used.

---

## Paste Sanitizer Rules

Strips: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`, `<button>`, Word namespace tags (`o:p`, `w:sdt`, `m:oMath`), `mso-*` / `-webkit-*` CSS, `font-size`, `font-family`, `line-height`.

| Element type | Preserved styles |
|---|---|
| Text (`span`, `p`, `li`, `h1`–`h6`) | `color`, `background-color`, `text-align`, `font-weight`, `font-style`, `text-decoration`, `vertical-align` |
| Structural (`img`, `table`, `td`, `th`, `div`) | Above + `border`, `width`, `height`, `max-width`, `float`, `display`, `margin`, `padding` |

---

## Build

```bash
# Build all dist artifacts (ESM + IIFE + minified CSS)
npm run build

# Open tests in browser (no CLI test runner)
open tests/unit-tests.html

# Demo pages
open index.html
open demo-editor.html
open demo-preview.html
```

---

## Links

- **NPM**: [@lakshaykumar/rich-text-editor](https://www.npmjs.com/package/@lakshaykumar/rich-text-editor)
- **GitHub**: [lakshaysharma684/rich-text-editor](https://github.com/lakshaysharma684/rich-text-editor)
- **Issues**: [GitHub Issues](https://github.com/lakshaysharma684/rich-text-editor/issues)

---

Built with ❤️ by **Lakshay Kumar** — MIT License
