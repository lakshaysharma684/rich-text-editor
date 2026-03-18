# Changelog

## v1.4.2 — Context Menu & UI Refinement
- **NEW: Custom Context Menu**: Added professional right-click support with configurable items and icons.
- **IMPROVEMENT: Unified Wrapping Toolbar**: Replaced the overflow dropdown with a multi-line wrapping toolbar for better accessibility.
- **IMPROVEMENT: Tooltip Support**: Added hover tooltips to all toolbar buttons for better usability.
- **IMPROVEMENT: Premium UI Redesign**: Modernized layouts across all demo and preview pages with high-end aesthetics.
- **IMPROVEMENT: Optional Auto-Save**: Auto-save is now disabled by default for a cleaner initial experience.
- **FIX: Source View Height**: Corrected the source code textarea to dynamically match the editor's height.

## v1.4.1 — Example Updates & Bug Fixes
- **FIX:** Updated all example files (`index.html`, `demo-editor.html`, `demo-preview.html`) to reference the latest version and features.
- **FIX:** Resolved caching issues in unit tests by implementing versioned imports.

## v1.4.0 — Extensible Platform Update
### New Features
- **NEW: Custom Plugin & Command System**: Extensible toolbar with `customButtons` support and `registerCommand()` API.
- **NEW: Interactive Table Resizer**: Real-time column resizing with visual handles.
- **NEW: Advanced Markdown Shortcuts**: Support for inline patterns (`**bold**`, `_italic_`, `` `code` ``, `[link](url)`).
- **NEW: Mobile Responsive Toolbar**: Automatic overflow menu ("...") for small screens.
- **NEW: Pro Image Handling**: Aspect ratio locking (hold `Shift`) and alignment presets (Left, Center, Right, Full).
- **NEW: Accessibility (A11y)**: Full ARIA labels, `role="textbox"` support, and standardized keyboard navigation.
- **NEW: Keyboard Shortcuts**: `Ctrl+K` (Link), `Alt+1-6` (Headings), `Alt+0` (Paragraph), `Ctrl+Enter` (Exit blocks).

### Improvements
- **IMPROVEMENT:** Updated global CSS for better table wrapping and image responsiveness.
- **IMPROVEMENT:** Enhanced unit test suite with 18+ comprehensive test cases.

### Bug Fixes
- **CRITICAL FIX:** Paste sanitizer now strips `font-size`, `font-family`, `line-height`, `mso-*`, `-webkit-*` and other layout-breaking styles from pasted external content (Google Docs, Microsoft Word, websites). Text now inherits the host application's design system correctly.
- **FIX:** Legacy `<font size="" face="">` tags are now converted to `<span>` preserving only color, preventing layout-breaking size/font attributes.
- **FIX:** Microsoft Office namespace elements (`<o:p>`, `<w:sdt>`, `<m:oMath>`) are removed on paste.
- **FIX:** Empty `<span>` wrappers left after style stripping are automatically unwrapped.
- **FIX:** `setFontSize()` now correctly converts `<font size="7">` to `<span style="font-size: Xpx">` without relying on unreliable browser timing.
- **FIX:** Paste handler now prefers native plain-text handling when clipboard HTML contains no meaningful markup (avoids unnecessary sanitization overhead).

### New Features
- **NEW:** `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) pastes as plain text, stripping all formatting.
- **NEW:** `onImageUpload` callback option — pass an async function that receives a `File` and returns a server URL. When provided, images are uploaded to your server instead of being embedded as base64 data URLs. Example:
  ```javascript
  new RichTextEditor('#editor', {
      onImageUpload: async (file) => {
          const form = new FormData();
          form.append('image', file);
          const res = await fetch('/upload', { method: 'POST', body: form });
          const data = await res.json();
          return data.url;
      }
  });
  ```
- **NEW:** AutoSave restore now shows a visible confirmation banner ("Restore Draft" / "Discard") instead of silently overwriting the editor on page load.

### Style Allowlist Reference
When pasting, only these CSS properties are preserved:

| Element Type | Preserved Styles |
|---|---|
| Text (`span`, `p`, `li`, `h1`–`h6`, etc.) | `color`, `background-color`, `text-align`, `font-weight`, `font-style`, `text-decoration`, `vertical-align` |
| Structural (`img`, `table`, `td`, `th`, `div`, `figure`) | Above + `border`, `width`, `height`, `max-width`, `float`, `display`, `margin`, `padding`, `position`, `overflow`, `object-fit`, `aspect-ratio` |
