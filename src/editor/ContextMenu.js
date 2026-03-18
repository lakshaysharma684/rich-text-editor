/**
 * ContextMenu module
 * Provides a custom right-click menu for the editor.
 */
export default class ContextMenu {
    constructor(editor, options = {}) {
        this.editor = editor; // The RichTextEditor instance
        this.options = options;
        this.menu = null;
        this.isVisible = false;

        this.init();
    }

    init() {
        this.createMenu();
        this.bindEvents();
    }

    createMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'rte-context-menu';
        this.menu.style.display = 'none';
        this.menu.style.position = 'fixed';
        this.menu.style.zIndex = '10000';
        document.body.appendChild(this.menu);
    }

    bindEvents() {
        // Prevent default context menu on editor element
        this.editor.editorElement.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // Hide on click anywhere else
        document.addEventListener('click', (e) => {
            if (this.isVisible && !this.menu.contains(e.target)) {
                this.hide();
            }
        });

        // Hide on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    handleContextMenu(e) {
        e.preventDefault();
        this.show(e.clientX, e.clientY);
    }

    show(x, y) {
        this.renderItems();
        this.menu.style.display = 'block';
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;

        // Check for boundary overflow
        const rect = this.menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.menu.style.left = `${window.innerWidth - rect.width - 5}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.menu.style.top = `${window.innerHeight - rect.height - 5}px`;
        }

        this.isVisible = true;
    }

    hide() {
        this.menu.style.display = 'none';
        this.isVisible = false;
    }

    renderItems() {
        this.menu.innerHTML = '';
        
        // Default items
        const defaultItems = [
            { label: 'Copy', icon: '📋', action: () => document.execCommand('copy') },
            { label: 'Cut', icon: '✂️', action: () => document.execCommand('cut') },
            { label: 'Paste', icon: '📥', action: () => this.handlePaste() },
            { type: 'divider' }
        ];

        // Custom items from options
        const customItems = this.options.items || [];
        
        const allItems = [...defaultItems, ...customItems];

        allItems.forEach(item => {
            if (item.type === 'divider') {
                const div = document.createElement('div');
                div.className = 'rte-context-divider';
                this.menu.appendChild(div);
                return;
            }

            const div = document.createElement('div');
            div.className = 'rte-context-item';
            div.innerHTML = `<span class="rte-context-icon">${item.icon || ''}</span> <span class="rte-context-label">${item.label}</span>`;
            
            div.onclick = (e) => {
                e.stopPropagation();
                if (item.command) {
                    this.editor.handleCommand(item.command, item.value);
                } else if (item.action) {
                    item.action(this.editor);
                }
                this.hide();
            };

            this.menu.appendChild(div);
        });
    }

    async handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            this.editor.handleCommand('insertText', text);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            alert('Clipboard access denied. Please use Ctrl+V / Cmd+V');
        }
    }
}
