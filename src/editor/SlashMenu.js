/**
 * SlashMenu module
 * Triggered by '/' to invoke commands quickly.
 */
export default class SlashMenu {
    constructor(editorElement, options = {}) {
        this.editor = editorElement;
        this.options = options;
        this.menu = null;
        this.isVisible = false;
        this.activeIndex = 0;
        this.query = '';
        this.range = null; // Range where '/' was typed

        this.items = [
            { label: 'Heading 1', icon: 'H1', command: 'formatBlock', value: 'H1' },
            { label: 'Heading 2', icon: 'H2', command: 'formatBlock', value: 'H2' },
            { label: 'Bullet List', icon: '•', command: 'insertUnorderedList' },
            { label: 'Numbered List', icon: '1.', command: 'insertOrderedList' },
            { label: 'Quote', icon: '❝', command: 'formatBlock', value: 'BLOCKQUOTE' },
            { label: 'Code Block', icon: '⟨/⟩', command: 'formatBlock', value: 'PRE' },
            { label: 'Image', icon: '🖼', custom: true, action: 'image' },
            { label: 'Table', icon: '▦', custom: true, action: 'table' },
            { label: 'Horizontal Rule', icon: '―', command: 'insertHorizontalRule' }
        ];

        this.init();
    }

    init() {
        this.createMenu();
        this.bindEvents();
    }

    createMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'rte-slash-menu';
        this.menu.style.display = 'none';
        document.body.appendChild(this.menu);
    }

    bindEvents() {
        this.editor.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.editor.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (this.isVisible && !this.menu.contains(e.target)) {
                this.hide();
            }
        });
    }

    handleKeyUp(e) {
        if (e.key === '/') {
            // Check if valid trigger (start of line or after space)
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // We could do more robust checking here, but simple is good for now.
                this.show(range);
            }
        } else if (this.isVisible) {
            // Update query
            // We need to capture text after the '/'
            // This is tricky with raw contentEditable, so we'll just handle basic navigation for now
            // Or typically we check the text context. 
            // For MVP, we'll just close if they type space or special chars? 
            // Let's keep it simple: any non-nav key is part of query?

            if (e.key === 'Escape') {
                this.hide();
            }
        }
    }

    handleKeyDown(e) {
        if (!this.isVisible) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.moveSelection(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.moveSelection(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.executeItem(this.items[this.activeIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.hide();
        }
    }

    show(range) {
        this.range = range.cloneRange();
        this.isVisible = true;
        this.activeIndex = 0;
        this.renderItems();

        // Position menu
        const rect = range.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        this.menu.style.display = 'block';
        this.menu.style.top = `${rect.bottom + scrollTop + 4}px`;
        this.menu.style.left = `${rect.left + scrollLeft}px`;
    }

    hide() {
        this.menu.style.display = 'none';
        this.isVisible = false;
        this.query = '';
    }

    moveSelection(direction) {
        this.activeIndex += direction;
        if (this.activeIndex < 0) this.activeIndex = this.items.length - 1;
        if (this.activeIndex >= this.items.length) this.activeIndex = 0;
        this.renderItems();
    }

    renderItems() {
        this.menu.innerHTML = '';
        this.items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = `rte-slash-item ${index === this.activeIndex ? 'active' : ''}`;
            div.innerHTML = `<span class="rte-slash-icon">${item.icon}</span> ${item.label}`;
            div.onclick = () => this.executeItem(item);
            this.menu.appendChild(div);
        });
    }

    executeItem(item) {
        // Delete the '/' character
        // We select the range where '/' was, plus any query text if we implemented that.
        // For now, assume just '/'

        // This is tricky because user might have typed more. 
        // Simplest: select valid range before '/' and delete? 
        // Or just let execCommand replace selection?

        // We need to remove the '/' first.
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Select the character before cursor (which should be '/')
        // This logic presumes we haven't typed more yet. 
        // Real implementations use a specialized input tracker.

        // Robust-ish way: Select start of this.range to current caret.
        if (this.range) {
            range.setStart(this.range.startContainer, this.range.startOffset);
            // Assume '/' is at startOffset - 1? 
            // Actually, we captured range *after* '/' was pressed in KeyUp? 
            // If KeyUp, '/' is inserted. So range is *after* it.
            // So we need to set start to startOffset - 1.
            range.setStart(this.range.startContainer, this.range.startOffset - 1);
            range.deleteContents();
        }

        if (item.custom) {
            if (this.options.onCustom) {
                this.options.onCustom(item.action);
            }
        } else {
            document.execCommand(item.command, false, item.value || null);
        }

        this.hide();
    }
}
