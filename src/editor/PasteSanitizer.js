export default class PasteSanitizer {
    constructor(editorElement) {
        this.editor = editorElement;
        this.init();
    }

    init() {
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));
    }

    handlePaste(e) {
        // If we have files (images), let ImageHandler deal with it (prevent check here if needed,
        // but usually text/html check is sufficient).
        // Note: If clipboard has BOTH files and text, we prioritize files in ImageHandler.
        // Ideally, we should coordinate, but for now, we process text/html if present.

        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        if (html) {
            e.preventDefault(); // Stop default paste
            const cleanHtml = this.sanitize(html);
            document.execCommand('insertHTML', false, cleanHtml);
        } else if (text) {
            // Allow default plain text paste, likely safe, effectively 'insertText'
            // But let's let default handle it to respect native OS behaviors unless we want full control.
            // Actually, standard behavior is fine for plain text.
        }
    }

    sanitize(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const body = doc.body;

        // 1. Remove dangerous tags
        const bannedTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
        bannedTags.forEach(tag => {
            const elements = body.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });

        // 2. Clear dangerous attributes logic
        const allElements = body.querySelectorAll('*');
        allElements.forEach(el => {
            // Remove all on* events
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            });

            // Clean 'style' - remove mso garbage (Word) but keep others
            if (el.hasAttribute('style')) {
                let style = el.getAttribute('style');
                // Use regex to remove mso-* properties
                // Matches "mso-something: value;" or "mso-something: value"
                let cleanStyle = style.replace(/mso-[^;]+;?/g, '').trim();

                if (cleanStyle) {
                    el.setAttribute('style', cleanStyle);
                } else {
                    el.removeAttribute('style');
                }
            }

            // Remove classes (usually we want our own styles, not source styles)
            if (el.hasAttribute('class')) {
                el.removeAttribute('class');
            }
        });

        return body.innerHTML;
    }
}
