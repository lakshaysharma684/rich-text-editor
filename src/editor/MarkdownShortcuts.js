export default class MarkdownShortcuts {
    constructor(editorElement) {
        this.editor = editorElement;
        this.init();
    }

    init() {
        this.editor.addEventListener('keyup', (e) => this.handleInput(e));
    }

    handleInput(e) {
        // Only trigger on Space (32)
        if (e.keyCode !== 32) return;

        const selection = window.getSelection();
        if (!selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const node = range.startContainer;

        // Check if we are in a text node
        if (node.nodeType !== 3) return;

        const text = node.textContent;
        // Get text up to caret
        const offset = range.startOffset;
        const textBefore = text.slice(0, offset);

        // Regex for patterns
        const patterns = [
            { // # H1
                regex: /^# $/,
                command: 'formatBlock', value: 'H1'
            },
            { // ## H2
                regex: /^## $/,
                command: 'formatBlock', value: 'H2'
            },
            { // > Blockquote
                regex: /^> $/,
                command: 'formatBlock', value: 'BLOCKQUOTE'
            },
            { // * or - for unordered list
                regex: /^[\*-] $/,
                command: 'insertUnorderedList', value: null
            },
            { // 1. for ordered list
                regex: /^1\. $/,
                command: 'insertOrderedList', value: null
            },
            { // ``` for code block
                regex: /^``` $/,
                command: 'formatBlock', value: 'PRE'
            },
            { // --- for Horizontal Rule
                regex: /^--- $/,
                command: 'insertHorizontalRule', value: null
            }
        ];

        for (const p of patterns) {
            if (p.regex.test(textBefore)) {
                // Matched!
                e.preventDefault();

                // Remove the markdown trigger characters
                const cleanText = text.slice(offset); // text after caret
                node.textContent = cleanText;

                // Execute the command
                document.execCommand(p.command, false, p.value);
                return;
            }
        }
    }
}
