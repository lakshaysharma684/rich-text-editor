export default class MarkdownShortcuts {
    constructor(editorElement) {
        this.editor = editorElement;
        this.init();
    }

    init() {
        this.editor.addEventListener('keyup', (e) => this.handleInput(e));
    }

    handleInput(e) {
        // Trigger on Space (32) or Enter (13)
        if (e.keyCode !== 32 && e.keyCode !== 13) return;

        const selection = window.getSelection();
        if (!selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const node = range.startContainer;

        // Check if we are in a text node
        if (node.nodeType !== 3) return;

        const text = node.textContent;
        const offset = range.startOffset;
        const textBefore = text.slice(0, offset);

        // 1. Block Patterns (existing)
        const blockPatterns = [
            { regex: /^# $/, command: 'formatBlock', value: 'H1' },
            { regex: /^## $/, command: 'formatBlock', value: 'H2' },
            { regex: /^> $/, command: 'formatBlock', value: 'BLOCKQUOTE' },
            { regex: /^[\*-] $/, command: 'insertUnorderedList', value: null },
            { regex: /^1\. $/, command: 'insertOrderedList', value: null },
            { regex: /^``` $/, command: 'formatBlock', value: 'PRE' },
            { regex: /^--- $/, command: 'insertHorizontalRule', value: null }
        ];

        for (const p of blockPatterns) {
            if (p.regex.test(textBefore)) {
                e.preventDefault();
                node.textContent = text.slice(offset);
                document.execCommand(p.command, false, p.value);
                return;
            }
        }

        // 2. Inline Patterns (New in v1.4.0)
        // Patterns: **bold**, _italic_, `code`, [label](url)
        const inlinePatterns = [
            { // **bold**
                regex: /\*\*(.*?)\*\* $/,
                replace: (match, p1) => `<b>${p1}</b>&nbsp;`
            },
            { // _italic_
                regex: /_(.*?)_ $/,
                replace: (match, p1) => `<i>${p1}</i>&nbsp;`
            },
            { // `code`
                regex: /`(.*?)` $/,
                replace: (match, p1) => `<code style="background:#f1f5f9;padding:2px 4px;border-radius:4px;font-family:monospace">${p1}</code>&nbsp;`
            },
            { // [label](url)
                regex: /\[(.*?)\]\((.*?)\) $/,
                replace: (match, p1, p2) => `<a href="${p2}">${p1}</a>&nbsp;`
            }
        ];

        for (const p of inlinePatterns) {
            const match = textBefore.match(p.regex);
            if (match) {
                e.preventDefault();
                
                // Remove the markdown pattern from the text node
                const beforeMatch = textBefore.slice(0, match.index);
                const afterMatch = text.slice(offset);
                
                // If we use insertHTML, we need to handle the range carefully
                const html = p.replace(...match);
                
                // Set new content
                node.textContent = beforeMatch;
                
                // Move range to after the text
                range.setStart(node, beforeMatch.length);
                range.setEnd(node, beforeMatch.length);
                selection.removeAllRanges();
                selection.addRange(range);

                // Insert the HTML
                document.execCommand('insertHTML', false, html);
                return;
            }
        }
    }
}
