export default class PasteSanitizer {
    constructor(editorElement) {
        this.editor = editorElement;
        this.init();
    }

    init() {
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));
    }

    handlePaste(e) {
        const htmlData = e.clipboardData.getData('text/html');
        if (htmlData) {
            const hasRealMarkup = /<(p|h[1-6]|ul|ol|li|table|img|a|strong|em|b|i|u|s|blockquote|pre|br)[^>]*>/i.test(htmlData);
            if (hasRealMarkup) {
                e.preventDefault();
                const sanitized = this.sanitize(htmlData);
                document.execCommand('insertHTML', false, sanitized);
                return;
            }
        }
        // Fall through: plain text paste handled natively by browser
    }

    sanitize(html) {
        const body = new DOMParser().parseFromString(html, 'text/html').body;

        // Remove dangerous tags
        ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'].forEach(tag => {
            body.querySelectorAll(tag).forEach(el => el.remove());
        });

        // Remove Word/Office namespace tags like <o:p>, <w:sdt>
        try {
            body.querySelectorAll('o\\:p, w\\:sdt, m\\:oMath').forEach(el => el.remove());
        } catch (e) {}

        // Normalize <font> tags to <span>, preserving only color
        body.querySelectorAll('font').forEach(el => {
            const span = document.createElement('span');
            const color = el.getAttribute('color');
            if (color) span.style.color = color;
            span.innerHTML = el.innerHTML;
            el.parentNode.replaceChild(span, el);
        });

        const STRUCTURAL_TAGS = new Set([
            'img', 'table', 'td', 'th', 'thead', 'tbody', 'tfoot', 'tr',
            'col', 'colgroup', 'iframe', 'video', 'figure', 'figcaption', 'div'
        ]);

        const TEXT_ALLOWED = new Set([
            'color', 'background-color', 'text-align', 'font-weight',
            'font-style', 'text-decoration', 'text-decoration-line', 'vertical-align'
        ]);

        const STRUCTURAL_ALLOWED = new Set([
            ...TEXT_ALLOWED,
            'border', 'border-collapse', 'border-spacing', 'border-radius',
            'width', 'height', 'max-width', 'min-width', 'max-height',
            'float', 'display', 'margin', 'padding',
            'position', 'top', 'left', 'right', 'bottom',
            'overflow', 'object-fit', 'aspect-ratio'
        ]);

        body.querySelectorAll('*').forEach(el => {
            // Remove event handlers
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
            });

            // Remove class, id, data-* attributes
            el.removeAttribute('class');
            el.removeAttribute('id');
            Array.from(el.attributes)
                .filter(a => a.name.startsWith('data-'))
                .forEach(a => el.removeAttribute(a.name));

            if (el.hasAttribute('style')) {
                const tag = el.tagName.toLowerCase();
                const isStructural = STRUCTURAL_TAGS.has(tag);
                const allowedSet = isStructural ? STRUCTURAL_ALLOWED : TEXT_ALLOWED;

                const rawStyle = el.getAttribute('style')
                    .replace(/mso-[^;]+;?/gi, '')
                    .replace(/font-size\s*:[^;]+;?/gi, '')
                    .replace(/font-family\s*:[^;]+;?/gi, '')
                    .replace(/line-height\s*:[^;]+;?/gi, '')
                    .replace(/-webkit-[^;]+;?/gi, '')
                    .replace(/-apple-[^;]+;?/gi, '');

                const kept = rawStyle
                    .split(';')
                    .map(d => d.trim())
                    .filter(d => {
                        if (!d) return false;
                        const prop = d.split(':')[0].trim().toLowerCase();
                        return [...allowedSet].some(a => prop === a || prop.startsWith(a + '-'));
                    });

                kept.length > 0
                    ? el.setAttribute('style', kept.join('; '))
                    : el.removeAttribute('style');
            }
        });

        // Unwrap empty <span> tags that have no remaining attributes
        Array.from(body.querySelectorAll('span')).reverse().forEach(span => {
            if (!span.hasAttributes()) {
                const parent = span.parentNode;
                if (!parent) return;
                while (span.firstChild) parent.insertBefore(span.firstChild, span);
                parent.removeChild(span);
            }
        });

        return body.innerHTML;
    }
}
