/**
 * Toolbar functionality for the Rich Text Editor.
 * Manages buttons and executes formatting commands.
 */
export default class Toolbar {
    /**
     * @param {HTMLElement} toolbarContainer - Element to stick buttons into
     * @param {HTMLElement} editorElement - The contenteditable area
     * @param {Object} options - Options like event handlers
     */
    constructor(toolbarContainer, editorElement, options = {}) {
        this.container = toolbarContainer;
        this.editor = editorElement;
        this.options = options;

        // Button definition: [Label, Command, Value]
        this.buttons = [
            // 1. History (Leftmost for quick access)
            { label: '↺', command: 'undo', title: 'Undo' },
            { label: '↻', command: 'redo', title: 'Redo' },
            { type: 'separator' },

            // 2. Typography & Colors (Most used)
            {
                type: 'select', command: 'fontName', title: 'Font Family', options: [
                    { label: 'Default', value: 'Inter, system-ui, sans-serif' },
                    { label: 'Arial', value: 'Arial, sans-serif' },
                    { label: 'Georgia', value: 'Georgia, serif' },
                    { label: 'Courier', value: '"Courier New", monospace' },
                    { label: 'Times', value: '"Times New Roman", serif' },
                    { label: 'Verdana', value: 'Verdana, sans-serif' },
                    { label: 'Comic Sans', value: '"Comic Sans MS", cursive' }
                ]
            },
            {
                type: 'select', command: 'customFontSize', title: 'Font Size', options: [
                    { label: 'Size', value: '' },
                    { label: '12px', value: '12px' },
                    { label: '14px', value: '14px' },
                    { label: '16px', value: '16px' },
                    { label: '18px', value: '18px' },
                    { label: '24px', value: '24px' },
                    { label: '32px', value: '32px' },
                    { label: '48px', value: '48px' },
                    { label: '72px', value: '72px' }
                ]
            },
            { label: 'H1', command: 'formatBlock', value: 'H1', title: 'Heading 1' },
            { label: 'H2', command: 'formatBlock', value: 'H2', title: 'Heading 2' },
            { label: '<b>B</b>', command: 'bold', title: 'Bold' },
            { label: '<i>I</i>', command: 'italic', title: 'Italic' },
            { label: '<u>U</u>', command: 'underline', title: 'Underline' },
            { label: '<s>S</s>', command: 'strikeThrough', title: 'Strikethrough' },
            // Colors inline with text formatting
            { label: '<span style="color:blue">A</span>', command: 'foreColor', type: 'color', title: 'Text Color' },
            { label: '<span style="background:#eee;padding:0 2px">Bg</span>', command: 'hiliteColor', type: 'color', title: 'Background Color' },
            { type: 'separator' },

            // 3. Structure & Alignment
            { label: '•', command: 'insertUnorderedList', title: 'Bullet List' },
            { label: '1.', command: 'insertOrderedList', title: 'Numbered List' },
            { label: '⇠', command: 'justifyLeft', title: 'Align Left' },
            { label: '⇿', command: 'justifyCenter', title: 'Align Center' },
            { label: '⇢', command: 'justifyRight', title: 'Align Right' },
            { label: '⇥', command: 'indent', title: 'Indent' },
            { label: '⇤', command: 'outdent', title: 'Outdent' },
            { type: 'separator' },

            // 4. Inserts & Blocks
            { label: '❝', command: 'formatBlock', value: 'BLOCKQUOTE', title: 'Quote' },
            { label: '⟨/⟩', command: 'formatBlock', value: 'PRE', title: 'Code Block' },
            { label: '🔗', command: 'createLink', needsValue: true, title: 'Insert Link' },
            { type: 'separator' },

            // 5. Media
            { label: '😀', command: 'insertEmoji', title: 'Insert Emoji' },
            { label: '🖼', command: 'customImage', title: 'Insert Image' },
            { label: '▶', command: 'insertVideo', title: 'Insert Video' },
            { label: '▦', command: 'insertTable', title: 'Insert Table' },
            { label: '―', command: 'insertHorizontalRule', title: 'Horizontal Rule' },
            { type: 'separator' },

            // 6. Tools (Right side)
            { label: 'Tₓ', command: 'removeFormat', title: 'Clear Formatting' },
            { label: '🔍', command: 'toggleSearch', title: 'Find & Replace' },
            { label: '🌙', command: 'toggleTheme', title: 'Toggle Dark Mode' },
            { label: '&lt;/&gt;', command: 'toggleSource', title: 'View Source' },
            { label: '⤢', command: 'toggleFullScreen', title: 'Full Screen' }
        ];

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = '';

        this.buttons.forEach(btn => {
            if (btn.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'rte-toolbar-divider';
                this.container.appendChild(separator);
                return;
            }

            // Handle Select Dropdowns (Fonts, etc.)
            if (btn.type === 'select') {
                const wrapper = document.createElement('div');
                wrapper.className = 'rte-select-wrapper';

                const select = document.createElement('select');
                select.title = btn.title;
                select.className = 'rte-toolbar-select';

                btn.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.innerText = opt.label;
                    select.appendChild(option);
                });

                select.onchange = () => {
                    this.execute(btn.command, select.value);
                    // Reset to show label effectively or keep state? 
                    // Usually font stays, but for now let's keep it simple.
                };

                wrapper.appendChild(select);
                this.container.appendChild(wrapper);
                return;
            }

            // Handle Color Pickers
            if (btn.type === 'color') {
                const wrapper = document.createElement('div');
                wrapper.className = 'rte-color-picker';
                wrapper.title = btn.title;

                const label = document.createElement('span');
                label.innerHTML = btn.label;

                const input = document.createElement('input');
                input.type = 'color';
                input.onchange = () => this.execute(btn.command, input.value);

                wrapper.appendChild(label);
                wrapper.appendChild(input);
                this.container.appendChild(wrapper);
                return;
            }

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'rte-toolbar-btn';
            button.innerHTML = btn.label;
            button.title = btn.title || '';
            button.dataset.command = btn.command;
            if (btn.value) button.dataset.value = btn.value;

            button.addEventListener('click', (e) => {
                e.preventDefault();

                // Custom Handlers
                if (['toggleFullScreen', 'insertVideo', 'insertTable', 'toggleSource', 'toggleTheme', 'insertEmoji', 'toggleSearch'].includes(btn.command)) {
                    if (this.options.onCustomCommand) {
                        this.options.onCustomCommand(btn.command, null, e.currentTarget);
                    }
                    return;
                }

                let value = btn.value;

                if (btn.needsValue) {
                    if (btn.command === 'createLink') {
                        if (this.options.onLinkClick) {
                            this.options.onLinkClick();
                            return;
                        }
                        // Fallback
                        value = prompt('Enter Link URL:', 'https://');
                        if (!value) return; // Cancelled
                    }
                }

                if (btn.command === 'customImage') {
                    if (this.options.onImageClick) {
                        this.options.onImageClick();
                    }
                    return;
                }

                this.execute(btn.command, value);
            });

            this.container.appendChild(button);
        });
    }

    execute(command, value = null) {
        this.editor.focus();

        // Intercept Custom Font Size
        if (command === 'customFontSize') {
            if (this.options.onCustomCommand && value) {
                this.options.onCustomCommand(command, value);
            }
            return;
        }

        // Handle toggling for Block commands (H1, H2, Blockquote)
        if (command === 'formatBlock') {
            const currentBlock = document.queryCommandValue('formatBlock');

            // Special Handling for Quotes (Inline <q> vs Block <blockquote>)
            if (value === 'BLOCKQUOTE') {
                const selection = window.getSelection();

                // 1. Inline Mode: If text is selected, toggle <q> tag
                if (!selection.isCollapsed) {
                    const anchorNode = selection.anchorNode;
                    // Check if we are inside a <q> tag
                    const qTag = anchorNode.nodeType === 3 ? anchorNode.parentElement.closest('q') : anchorNode.closest('q');

                    if (qTag) {
                        // UN-QUOTE: Replace the <q> tag with its own content
                        // We select the whole <q> tag first to ensure we replace the tag itself
                        const range = document.createRange();
                        range.selectNode(qTag);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        document.execCommand('insertHTML', false, qTag.innerHTML);
                    } else {
                        // QUOTE: Wrap selection in <q>
                        const selectedText = selection.toString();
                        document.execCommand('insertHTML', false, `<q>${selectedText}</q>`);
                    }
                    this.updateActiveStates();
                    return;
                }
            }

            // 2. Block Mode: Use standard behavior (toggle H1, H2, Blockquote)
            // If we are already in this block type, toggle it off (revert to Paragraph)
            if (currentBlock && value && currentBlock.toLowerCase() === value.toLowerCase()) {
                document.execCommand('formatBlock', false, 'P');
                this.updateActiveStates();
                return;
            }
        }

        // Handle toggling for Alignment
        if (['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].includes(command)) {
            const isAlreadyActive = document.queryCommandState(command);
            if (isAlreadyActive) {
                // If clicking the currently active alignment, toggle back to default (Left)
                // Note: If we are clicking 'justifyLeft' and it's already left, this does nothing visually, which is fine.
                // But if we click Center when Center is active, we go Left.
                document.execCommand('justifyLeft', false, null);
                this.updateActiveStates();
                return;
            }
        }

        document.execCommand(command, false, value);
        this.updateActiveStates();
    }

    bindEvents() {
        // Update toolbar state when selection changes
        document.addEventListener('selectionchange', () => {
            // Only update if selection is inside our editor
            if (this.editor.contains(window.getSelection().anchorNode)) {
                this.updateActiveStates();
            }
        });

        this.editor.addEventListener('keyup', () => this.updateActiveStates());
        this.editor.addEventListener('mouseup', () => this.updateActiveStates());
    }

    updateActiveStates() {
        const buttons = this.container.querySelectorAll('.rte-toolbar-btn');

        buttons.forEach(btn => {
            const command = btn.dataset.command;
            if (!command) return;

            let isActive = false;

            // Special handling for block commands like H1, H2, Blockquote
            if (command === 'formatBlock') {
                const value = btn.dataset.value;
                isActive = document.queryCommandValue(command).toLowerCase() === value.toLowerCase();
            } else {
                isActive = document.queryCommandState(command);
            }

            if (isActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    updateButtonIcon(command, icon) {
        const btn = this.container.querySelector(`button[data-command="${command}"]`);
        if (btn) {
            btn.innerHTML = icon;
        }
    }
}
