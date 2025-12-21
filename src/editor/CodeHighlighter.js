/**
 * CodeHighlighter module
 * Adds basic syntax highlighting to <pre> blocks.
 * Focused on JavaScript/HTML-like syntax for now.
 */
export default class CodeHighlighter {
    constructor(editorElement) {
        this.editor = editorElement;
        this.init();
    }

    init() {
        this.bindEvents();
        this.highlightAll();
    }

    bindEvents() {
        // Highlight when leaving a code block to avoid cursor jumping issues
        this.editor.addEventListener('focusout', (e) => {
            if (e.target.tagName === 'PRE') {
                this.highlightBlock(e.target);
            }
        });

        // Also handle Paste events specially? For now, just rely on blur or manual trigger.
    }

    highlightAll() {
        const blocks = this.editor.querySelectorAll('pre');
        blocks.forEach(block => this.highlightBlock(block));
    }

    highlightBlock(block) {
        // Get raw text
        let text = block.innerText;

        // Skip if already highlighted (heuristic: contains spans?)
        // Actually, we want to Re-highlight so we strip existing HTML first?
        // But innerText usually gives us clean text.

        // Escape HTML to prevent injection
        text = text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Simple Regex Tokenizer
        // Order matters!
        const patterns = [
            // Comments
            { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, type: 'comment' },
            // Strings (single, double, backtick)
            { pattern: /(".*?"|'.*?'|`[\s\S]*?`)/g, type: 'string' },
            // Keywords
            { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|this|new|try|catch|async|await)\b/g, type: 'keyword' },
            // Numbers
            { pattern: /\b(\d+)\b/g, type: 'number' },
            // Functions (rough approximation: word followed by paren)
            { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g, type: 'function' }
        ];

        // We can't just run replace sequentially on the same string because they might overlap
        // (e.g. string might contain keyword). 
        // A placeholder approach is needed.

        // 1. Extract tokens and replace with placeholders
        const tokens = [];
        let processed = text;

        patterns.forEach(({ pattern, type }) => {
            processed = processed.replace(pattern, (match) => {
                const id = `__TOKEN_${tokens.length}__`;
                tokens.push({ id, value: match, type });
                return id;
            });
        });

        // 2. Restore tokens wrapped in spans
        // We have to work backwards or be careful? 
        // Actually, replace placeholders with spanned content.

        // BUT: What if a string contains `__TOKEN_` text? Rare but possible.
        // Also, Regex replacement order: If I replace strings first, keywords inside won't match. 
        // But if I replace keywords first, "const" inside a string will be messed up.
        // Correct order: Strings & Comments FIRST (they are opaque). Then Keywords etc.

        // Let's refine the logic. It's tricky with simple replace.
        // Alternative: One big Regex?
        // /(\/\/.*)|(".*?")|\b(const|let)\b/ ...

        const combinedRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)|(".*?"|'.*?'|`[\s\S]*?`)|(\b\d+\b)|(\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|default|this|new|try|catch|async|await)\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\())/g;

        const output = text.replace(combinedRegex, (match, comment, string, number, keyword, func) => {
            if (comment) return `<span class="rte-token-comment">${match}</span>`;
            if (string) return `<span class="rte-token-string">${match}</span>`;
            if (number) return `<span class="rte-token-number">${match}</span>`;
            if (keyword) return `<span class="rte-token-keyword">${match}</span>`;
            if (func) return `<span class="rte-token-function">${match}</span>`;
            return match;
        });

        block.innerHTML = output;
    }
}
