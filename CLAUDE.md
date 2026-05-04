# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build all dist artifacts (ESM + IIFE + minified CSS)
npm run build

# Open tests in browser (no CLI test runner exists)
open tests/unit-tests.html

# Demo pages
open index.html
open demo-editor.html
open demo-preview.html
```

> There is no `npm test` — tests run in-browser via `tests/unit-tests.html`. The package.json `test` script just echoes a message.

## Architecture

Zero-dependency ES module library. Entry point: `src/editor/RichTextEditor.js`. Build outputs to `dist/` via esbuild (configured inline in package.json scripts, no config file).

### Module Composition Pattern

`RichTextEditor` is the orchestrator. It instantiates and coordinates 19 feature modules. Each module is a class that receives the editor's DOM elements and config, then wires up its own event listeners.

```
src/editor/
  RichTextEditor.js      ← main class, public API, module init
  Toolbar.js             ← renders all buttons, dispatches handleCommand()
  MarkdownShortcuts.js   ← real-time inline/block markdown conversion
  PasteSanitizer.js      ← strips dangerous tags/styles on paste
  ImageHandler.js        ← drag-drop + upload callback
  ImageResizer.js        ← Shift+drag aspect-ratio locking, alignment presets
  TableResizer.js        ← drag-to-resize column widths
  SlashMenu.js           ← `/` command palette
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
src/styles/rte.css       ← all styles, CSS variables for dark mode
src/wrapper.js           ← IIFE global export for non-npm usage
```

### Command Dispatch

All formatting flows through `handleCommand(cmd, value, target)`. Custom plugins override this:

```javascript
const editor = new RichTextEditor('#el', {
  customButtons: [{ id: 'my-btn', label: 'X', command: 'myCmd' }],
  contextMenuItems: [{ label: 'Do X', command: 'myCmd' }],
});
editor.registerCommand('myCmd', (value, target) => { /* ... */ });
```

`registerCommand()` stores callbacks in a registry checked before built-in commands execute.

### Public API

```javascript
editor.getHTML()         // returns editor innerHTML
editor.setHTML(html)     // sets content
editor.clear()           // empties editor
editor.handleCommand(cmd, value, target)
editor.registerCommand(name, fn)
```

### External Libraries (CDN, loaded dynamically)

- **Mammoth.js** — Word .docx import (FileImporter)
- **Turndown** — HTML→Markdown export (Exporter)
- **html2pdf.js** — PDF export (Exporter)

None are bundled; they load on-demand when those features are used.

### Paste Sanitizer Rules

Strips: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`, `<button>`, Word namespace tags (`o:p`, `w:sdt`, `m:oMath`), `mso-*` / `-webkit-*` CSS, `font-size`, `font-family`, `line-height`.  
Preserves: `color`, `background-color`, `text-align`, `font-weight`, `font-style`, `text-decoration`. Structural elements also keep `border`, `width`, `height`, `padding`, `margin`, `display`.

### Keyboard Shortcuts (built into RichTextEditor.js)

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd+K` | Link picker |
| `Alt+1–6` | Heading levels |
| `Alt+0` | Paragraph |
| `Ctrl+Shift+V` | Paste as plain text |
| `Ctrl+Enter` | Exit blockquote/list |

### Constructor Options

```javascript
new RichTextEditor(selector, {
  placeholder: 'Start typing...',
  enableAutoSave: false,
  autoSaveKey: null,          // localStorage key
  customButtons: [],          // { id, label, command, title? }
  contextMenuItems: [],       // { label, command }
  onImageUpload: null,        // async (file) => url
})
```
