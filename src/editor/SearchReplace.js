export default class SearchReplace {
    constructor(editorElement) {
        this.editor = editorElement;
        this.bar = null;
        this.matches = [];
        this.matchIndex = -1;
        this.isOpen = false;

        this.init();
    }

    init() {
        // Create Search Bar UI
        this.bar = document.createElement('div');
        this.bar.className = 'rte-search-bar';
        this.bar.style.display = 'none';

        this.bar.innerHTML = `
            <div class="rte-search-inputs">
                <input type="text" id="rte-find-input" placeholder="Find...">
                <input type="text" id="rte-replace-input" placeholder="Replace with...">
            </div>
            <div class="rte-search-actions">
                <button id="rte-find-prev" title="Previous">⬆</button>
                <button id="rte-find-next" title="Next">⬇</button>
                <button id="rte-replace-btn">Replace</button>
                <button id="rte-replace-all-btn">All</button>
                <button id="rte-close-search" title="Close">✕</button>
            </div>
            <div id="rte-search-stats">0/0</div>
        `;

        document.body.appendChild(this.bar);
        this.bindEvents();
    }

    bindEvents() {
        const findInput = this.bar.querySelector('#rte-find-input');
        const replaceInput = this.bar.querySelector('#rte-replace-input');

        findInput.addEventListener('input', () => this.find(findInput.value));

        this.bar.querySelector('#rte-find-next').onclick = () => this.next();
        this.bar.querySelector('#rte-find-prev').onclick = () => this.prev();

        this.bar.querySelector('#rte-replace-btn').onclick = () => this.replace();
        this.bar.querySelector('#rte-replace-all-btn').onclick = () => this.replaceAll();

        this.bar.querySelector('#rte-close-search').onclick = () => this.hide();

        // Shortcut to open? Maybe handled by Editor command
    }

    toggle() {
        if (this.isOpen) this.hide();
        else this.show();
    }

    show() {
        this.bar.style.display = 'flex';
        this.isOpen = true;

        // Position relative to editor or fixed top-right
        const rect = this.editor.getBoundingClientRect();
        this.bar.style.top = (rect.top + window.scrollY + 5) + 'px';
        this.bar.style.right = (document.body.clientWidth - rect.right + 5) + 'px'; // right aligned

        this.bar.querySelector('#rte-find-input').focus();
    }

    hide() {
        this.clearHighlights();
        this.bar.style.display = 'none';
        this.isOpen = false;
        this.editor.focus();
    }

    find(text) {
        this.clearHighlights();
        if (!text) {
            this.updateStats(0, 0);
            return;
        }

        // 1. Traverse and Highlight
        const treeWalker = document.createTreeWalker(this.editor, NodeFilter.SHOW_TEXT);
        const nodeList = [];
        let currentNode;
        while (currentNode = treeWalker.nextNode()) {
            nodeList.push(currentNode);
        }

        let totalMatches = 0;

        // We need to be careful not to break HTML structure. 
        // Simple approach: regex replace in valid text nodes.
        // NOTE: This implementation is complex because replacing a text node invalidates the walker/list.
        // Better: Gather all matches first, then highlight.

        // Actually, let's use a simpler approach for v1: Get innerHTML, regex replace with spans.
        // Warning: This kills event listeners on images/etc if any. But our editor is simple.
        // Ideally we should preserve nodes. But for plain text highlighting it's okay.

        // Let's stick to Node iteration to be safe.

        const regex = new RegExp(text, 'gi');

        nodeList.forEach(node => {
            const matches = [...node.textContent.matchAll(regex)];
            if (matches.length > 0) {
                // Determine split points
                // This is tricky. Let's do a simple recursive helper per node?
                // Or: Replace the node's text with fragments.

                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                node.textContent.replace(regex, (match, offset) => {
                    // Text before match
                    fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex, offset)));

                    // Match wrapped in span
                    const span = document.createElement('span');
                    span.className = 'rte-search-match';
                    span.textContent = match;
                    fragment.appendChild(span);

                    lastIndex = offset + match.length;
                    return match;
                });

                // Remaining text
                fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex)));

                node.parentNode.replaceChild(fragment, node);
            }
        });

        // Collect matches for navigation
        this.matches = Array.from(this.editor.querySelectorAll('.rte-search-match'));
        this.updateStats(this.matches.length > 0 ? 1 : 0, this.matches.length);

        if (this.matches.length > 0) {
            this.matchIndex = 0;
            this.highlightCurrent();
        } else {
            this.matchIndex = -1;
        }
    }

    updateStats(current, total) {
        this.bar.querySelector('#rte-search-stats').innerText = `${current}/${total}`;
    }

    highlightCurrent() {
        this.matches.forEach((m, i) => {
            if (i === this.matchIndex) {
                m.classList.add('active');
                m.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                m.classList.remove('active');
            }
        });
        this.updateStats(this.matches.length === 0 ? 0 : this.matchIndex + 1, this.matches.length);
    }

    next() {
        if (this.matches.length === 0) return;
        this.matchIndex = (this.matchIndex + 1) % this.matches.length;
        this.highlightCurrent();
    }

    prev() {
        if (this.matches.length === 0) return;
        this.matchIndex = (this.matchIndex - 1 + this.matches.length) % this.matches.length;
        this.highlightCurrent();
    }

    clearHighlights() {
        // Remove spans but keep text
        const matches = this.editor.querySelectorAll('.rte-search-match');
        matches.forEach(span => {
            const text = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(text, span);
        });
        // Normalize to merge adjacent text nodes
        this.editor.normalize();
        this.matches = [];
        this.matchIndex = -1;
    }

    replace() {
        if (this.matchIndex === -1 || this.matches.length === 0) return;

        const replacement = this.bar.querySelector('#rte-replace-input').value;
        const currentParams = { index: this.matchIndex, total: this.matches.length }; // Save state

        // 1. Replace the text of the ACTIVE match
        const activeSpan = this.matches[this.matchIndex];
        const newText = document.createTextNode(replacement);
        activeSpan.parentNode.replaceChild(newText, activeSpan);

        // 2. Re-run find to refresh list (simplest way to handle DOM updates)
        // Or manually update list. Simpler to re-find.
        // Ideally we keep the search term.
        const term = this.bar.querySelector('#rte-find-input').value;
        this.find(term);
    }

    replaceAll() {
        const replacement = this.bar.querySelector('#rte-replace-input').value;
        const term = this.bar.querySelector('#rte-find-input').value;

        // Simply: clear highlights, then do string replace on innerHTML? 
        // No, that clears events.
        // Better: Iterate all matches found by 'find', replace them.

        // If we haven't found yet run find
        if (this.matches.length === 0) this.find(term);

        this.matches.forEach(span => {
            const newText = document.createTextNode(replacement);
            span.parentNode.replaceChild(newText, span);
        });

        this.editor.normalize();
        this.matches = [];
        this.matchIndex = -1;
        this.updateStats(0, 0);

        // Trigger input event
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
