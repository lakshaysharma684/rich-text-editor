# Changelog

## v1.5.0 — System Dark Mode & Toolbar Restriction

### New Features
- **NEW: `toolbarItems` option** — Pass an array of command strings to restrict which toolbar buttons render. Unlisted buttons are hidden. Separators between hidden buttons collapse automatically. Omit (or pass `null`) to show all buttons — zero behavior change for existing editors.
  ```javascript
  new RichTextEditor('#indications-rte', {
      toolbarItems: ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList', 'removeFormat']
  });
  ```
- **NEW: System dark mode** — Editor auto-detects `prefers-color-scheme: dark` on init and applies `.rte-dark-mode`. Listens for live OS theme changes. Once the user manually clicks the theme toggle, auto-sync stops (manual preference wins).
- **NEW: `.rte-light-mode` class** — Force light mode regardless of OS preference (complements existing `.rte-dark-mode`).

### Improvements
- **IMPROVEMENT: CSS architecture overhaul** — All colors migrated to CSS custom properties (`--rte-bg`, `--rte-text`, `--rte-border`, etc.). Light/dark now driven purely by variable swaps. `@media (prefers-color-scheme: dark)` applied at `:root` level for zero-JS dark mode in static embeds.
- **IMPROVEMENT: Editor layout** — Cleaner toolbar (32px buttons, tighter 2px gap, refined hover/active states). Content area has focus ring on wrapper, improved typography (`line-height: 1.7`, `caret-color` set to primary, `code` inline style), polished blockquote and pre blocks.
- **IMPROVEMENT: Fullscreen mode** — Content area now max-width constrained (860px) and centered in fullscreen for comfortable reading on wide monitors.
- **IMPROVEMENT: Modal backdrop** — Table picker and link picker modals now use `backdrop-filter: blur(2px)` for depth.
- **IMPROVEMENT: Demo pages** — Both `index.html` and `demo-editor.html` fully redesigned: sticky nav, CSS custom props + `@media` dark mode, two-editor side-by-side layout on wide screens, syntax-highlighted usage snippet.
- **IMPROVEMENT: Removed hardcoded `max-width: 800px`** from `.rte-wrapper` — parent containers now control editor width.

### Bug Fixes
- **FIX:** Invalid CSS `@media` inside selector list in dark-mode select arrow rule — split into two separate valid rules.

---

## v1.4.2 — Context Menu & UI Refinement
- **NEW: Custom Context Menu**: Added professional right-click support with configurable items and icons.
- **IMPROVEMENT: Unified Wrapping Toolbar**: Replaced the overflow dropdown with a multi-line wrapping toolbar for better accessibility.
- **IMPROVEMENT: Tooltip Support**: Added hover tooltips to all toolbar buttons for better usability.
- **IMPROVEMENT: Premium UI Redesign**: Modernized layouts across all demo and preview pages with high-end aesthetics.
- **IMPROVEMENT: Optional Auto-Save**: Auto-save is now disabled by default for a cleaner initial experience.
- **FIX: Source View Height**: Corrected the source code textarea to dynamically match the editor's height.

---

## v1.4.1 — Example Updates & Bug Fixes
- **FIX:** Updated all example files (`index.html`, `demo-editor.html`, `demo-preview.html`) to reference the latest version and features.
- **FIX:** Resolved caching issues in unit tests by implementing versioned imports.

---

## v1.4.0 — Extensible Platform Update

### New Features
- **NEW: Custom Plugin & Command System**: Extensible toolbar with `customButtons` support and `registerCommand()` API.
- **NEW: Interactive Table Resizer**: Real-time column resizing with visual handles.
- **NEW: Advanced Markdown Shortcuts**: Support for inline patterns (`**bold**`, `_italic_`, `` `code` ``, `[link](url)`).
- **NEW: Mobile Responsive Toolbar**: Automatic overflow menu ("...") for small screens.
- **NEW: Pro Image Handling**: Aspect ratio locking (hold `Shift`) and alignment presets (Left, Center, Right, Full).
- **NEW: Accessibility (A11y)**: Full ARIA labels, `role="textbox"` support, and standardized keyboard navigation.
- **NEW: Keyboard Shortcuts**: `Ctrl+K` (Link), `Alt+1–6` (Headings), `Alt+0` (Paragraph), `Ctrl+Enter` (Exit blocks).
- **NEW: `Ctrl+Shift+V`** — Paste as plain text, stripping all formatting.
- **NEW: `onImageUpload` callback** — Async function receives a `File`, returns a server URL. When provided, images upload to your server instead of embedding as base64.
- **NEW: AutoSave restore banner** — Shows "Restore Draft / Discard" confirmation instead of silently overwriting editor on page load.

### Bug Fixes
- **CRITICAL FIX:** Paste sanitizer now strips `font-size`, `font-family`, `line-height`, `mso-*`, `-webkit-*` from pasted external content.
- **FIX:** Legacy `<font size="" face="">` tags converted to `<span>` preserving only color.
- **FIX:** Microsoft Office namespace elements (`<o:p>`, `<w:sdt>`, `<m:oMath>`) removed on paste.
- **FIX:** Empty `<span>` wrappers left after style stripping are automatically unwrapped.
- **FIX:** `setFontSize()` now correctly converts `<font size="7">` to `<span style="font-size: Xpx">`.

---

## v1.3.1 — NPM Release
- Initial public NPM release.
- Zero-dependency ES module build via esbuild.
- Core modules: Toolbar, FloatingMenu, MarkdownShortcuts, PasteSanitizer, ImageHandler, ImageResizer, EmojiPicker, TablePicker, SearchReplace, CodeHighlighter, AutoSave, LinkTooltip, SlashMenu, LinkPicker, FileImporter, TableResizer, ContextMenu, Exporter.
