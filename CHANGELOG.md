# Changelog

## v1.3.1 — Paste Sanitization & UX Improvements

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
