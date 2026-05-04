export default class Toolbar {
    constructor(toolbarContainer, editorElement, options = {}) {
        this.container = toolbarContainer;
        this.editor = editorElement;
        this.options = options;

        this.buttons = [
            // History
            { label: '↺', command: 'undo',  title: 'Undo (Ctrl+Z)' },
            { label: '↻', command: 'redo',  title: 'Redo (Ctrl+Y)' },
            { type: 'separator' },

            // Typography
            {
                type: 'select', command: 'fontName', title: 'Font Family', options: [
                    { label: 'Default',    value: 'Inter, system-ui, sans-serif' },
                    { label: 'Arial',      value: 'Arial, sans-serif' },
                    { label: 'Georgia',    value: 'Georgia, serif' },
                    { label: 'Courier',    value: '"Courier New", monospace' },
                    { label: 'Times',      value: '"Times New Roman", serif' },
                    { label: 'Verdana',    value: 'Verdana, sans-serif' },
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
            { label: 'H1', command: 'formatBlock', value: 'H1', title: 'Heading 1 (Alt+1)' },
            { label: 'H2', command: 'formatBlock', value: 'H2', title: 'Heading 2 (Alt+2)' },
            { type: 'separator' },

            // Text formatting
            { label: '<b>B</b>',   command: 'bold',         title: 'Bold (Ctrl+B)' },
            { label: '<i>I</i>',   command: 'italic',       title: 'Italic (Ctrl+I)' },
            { label: '<u>U</u>',   command: 'underline',    title: 'Underline (Ctrl+U)' },
            { label: '<s>S</s>',   command: 'strikeThrough', title: 'Strikethrough' },
            { label: '<span style="color:#3b82f6;font-weight:700">A</span>', command: 'foreColor',  type: 'color', title: 'Text Color' },
            { label: '<span style="background:#fef08a;padding:0 3px;border-radius:2px">A</span>', command: 'hiliteColor', type: 'color', title: 'Highlight Color' },
            { type: 'separator' },

            // Structure
            { label: '≡',  command: 'insertUnorderedList', title: 'Bullet List' },
            { label: '⋮≡', command: 'insertOrderedList',   title: 'Numbered List' },
            { label: '⬅', command: 'justifyLeft',          title: 'Align Left' },
            { label: '↔', command: 'justifyCenter',         title: 'Align Center' },
            { label: '➡', command: 'justifyRight',          title: 'Align Right' },
            { label: '→|', command: 'indent',               title: 'Indent' },
            { label: '|←', command: 'outdent',              title: 'Outdent' },
            { type: 'separator' },

            // Blocks & inserts
            { label: '❝',    command: 'formatBlock', value: 'BLOCKQUOTE', title: 'Blockquote' },
            { label: '⟨/⟩', command: 'formatBlock', value: 'PRE',        title: 'Code Block' },
            { label: '🔗',   command: 'createLink',  needsValue: true,    title: 'Insert Link (Ctrl+K)' },
            { type: 'separator' },

            // Media
            { label: '😀', command: 'insertEmoji',         title: 'Emoji' },
            { label: '🖼',  command: 'customImage',         title: 'Insert Image' },
            { label: '▶',   command: 'insertVideo',         title: 'Embed Video' },
            { label: '📂',  command: 'customImport',        title: 'Import Word / Docs' },
            { label: '▦',   command: 'insertTable',         title: 'Insert Table' },
            { label: '―',   command: 'insertHorizontalRule', title: 'Horizontal Rule' },
            { type: 'separator' },

            // Utilities — pushed to right end
            { label: 'Tₓ', command: 'removeFormat',  title: 'Clear Formatting' },
            {
                type: 'dropdown', label: 'Export', title: 'Export', items: [
                    { label: '⬇ Markdown', command: 'exportMarkdown' },
                    { label: '⬇ PDF',      command: 'exportPDF' }
                ]
            },
            { label: '🔍', command: 'toggleSearch',    title: 'Find & Replace' },
            { label: '🌙', command: 'toggleTheme',     title: 'Toggle Dark Mode' },
            { label: '&lt;/&gt;', command: 'toggleSource',    title: 'View HTML Source' },
            { label: '⤢',  command: 'toggleFullScreen', title: 'Fullscreen' }
        ];

        // Custom buttons
        if (this.options.customButtons && this.options.customButtons.length > 0) {
            this.buttons.push({ type: 'separator' });
            this.options.customButtons.forEach(btn => {
                this.buttons.push({ ...btn, isCustom: true });
            });
        }

        this.init();
        window.addEventListener('resize', () => this.checkOverflow());
    }

    init() {
        this.render();
        requestAnimationFrame(() => this.checkOverflow());
        this.bindEvents();
    }

    // ── Render ──────────────────────────────────────────────────────────────

    render() {
        this.container.innerHTML = '';

        // toolbarItems filter
        const allowedSet = (
            this.options.toolbarItems &&
            Array.isArray(this.options.toolbarItems) &&
            this.options.toolbarItems.length > 0
        ) ? new Set(this.options.toolbarItems) : null;

        let visible = this.buttons;

        if (allowedSet) {
            visible = visible.filter(btn => {
                if (btn.type === 'separator') return true;
                if (btn.type === 'dropdown') return btn.items && btn.items.some(i => allowedSet.has(i.command));
                return allowedSet.has(btn.command);
            });

            visible = visible.filter((btn, i, arr) => {
                if (btn.type !== 'separator') return true;
                const prev = arr[i - 1];
                const next = arr[i + 1];
                if (!prev || !next || prev.type === 'separator') return false;
                return true;
            });
        }

        // Split into groups on separators
        const groups = [[]];
        visible.forEach(btn => {
            if (btn.type === 'separator') groups.push([]);
            else groups[groups.length - 1].push(btn);
        });

        const nonEmpty = groups.filter(g => g.length > 0);

        nonEmpty.forEach((groupBtns, idx) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'rte-btn-group';
            if (idx === nonEmpty.length - 1 && nonEmpty.length > 1) {
                groupEl.classList.add('rte-btn-group--end');
            }

            groupBtns.forEach(btn => {
                const el = this._renderItem(btn);
                if (el) groupEl.appendChild(el);
            });

            this.container.appendChild(groupEl);
        });
    }

    _renderItem(btn) {
        if (btn.type === 'select')   return this._renderSelect(btn);
        if (btn.type === 'color')    return this._renderColor(btn);
        if (btn.type === 'dropdown') return this._renderDropdown(btn);
        return this._renderButton(btn);
    }

    _renderSelect(btn) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rte-select-wrapper';

        const select = document.createElement('select');
        select.className = 'rte-toolbar-select';
        select.title = btn.title || '';
        select.setAttribute('aria-label', btn.title || 'Select');

        btn.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.innerText = opt.label;
            select.appendChild(o);
        });

        select.onchange = () => this.execute(btn.command, select.value);
        wrapper.appendChild(select);
        return wrapper;
    }

    _renderColor(btn) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rte-color-picker';
        wrapper.title = btn.title || '';
        wrapper.setAttribute('aria-label', btn.title || 'Color');
        if (btn.title) wrapper.setAttribute('data-tooltip', btn.title);

        const label = document.createElement('span');
        label.innerHTML = btn.label;

        const input = document.createElement('input');
        input.type = 'color';
        input.onchange = () => this.execute(btn.command, input.value);

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        return wrapper;
    }

    _renderDropdown(btn) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rte-dropdown-wrapper';

        const button = document.createElement('button');
        button.className = 'rte-toolbar-btn rte-dropdown-trigger';
        button.innerHTML = `${btn.label} <span class="rte-dropdown-arrow">▾</span>`;
        button.title = btn.title || '';
        button.setAttribute('aria-label', btn.title || btn.label);
        if (btn.title) button.setAttribute('data-tooltip', btn.title);

        const menu = document.createElement('div');
        menu.className = 'rte-dropdown-menu';

        btn.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'rte-dropdown-item';
            itemEl.innerText = item.label;
            itemEl.onclick = () => {
                this.execute(item.command);
                menu.classList.remove('show');
            };
            menu.appendChild(itemEl);
        });

        button.onclick = (e) => {
            e.stopPropagation();
            this.container.querySelectorAll('.rte-dropdown-menu.show').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            menu.classList.toggle('show');
        };

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) menu.classList.remove('show');
        });

        wrapper.appendChild(button);
        wrapper.appendChild(menu);
        return wrapper;
    }

    _renderButton(btn) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rte-toolbar-btn';
        button.innerHTML = btn.label;
        button.title = btn.title || '';
        button.setAttribute('aria-label', btn.title || btn.label);
        button.dataset.command = btn.command;
        if (btn.title) button.setAttribute('data-tooltip', btn.title);
        if (btn.value) button.dataset.value = btn.value;

        button.addEventListener('click', (e) => {
            e.preventDefault();

            const customCmds = ['toggleFullScreen', 'insertVideo', 'insertTable', 'toggleSource',
                                'toggleTheme', 'insertEmoji', 'toggleSearch', 'customImport'];
            if (customCmds.includes(btn.command)) {
                if (this.options.onCustomCommand) {
                    this.options.onCustomCommand(btn.command, null, e.currentTarget);
                }
                return;
            }

            let value = btn.value;

            if (btn.needsValue && btn.command === 'createLink') {
                if (this.options.onLinkClick) { this.options.onLinkClick(); return; }
                value = prompt('Enter Link URL:', 'https://');
                if (!value) return;
            }

            if (btn.command === 'customImage') {
                if (this.options.onImageClick) this.options.onImageClick();
                return;
            }

            this.execute(btn.command, value);
        });

        return button;
    }

    // ── Execute ─────────────────────────────────────────────────────────────

    execute(command, value = null) {
        this.editor.focus();

        if (['customFontSize', 'exportMarkdown', 'exportPDF'].includes(command)) {
            if (this.options.onCustomCommand) this.options.onCustomCommand(command, value);
            return;
        }

        if (command === 'formatBlock') {
            const current = document.queryCommandValue('formatBlock');

            if (value === 'BLOCKQUOTE') {
                const sel = window.getSelection();
                if (!sel.isCollapsed) {
                    const anchor = sel.anchorNode;
                    const qTag = anchor.nodeType === 3
                        ? anchor.parentElement.closest('q')
                        : anchor.closest('q');

                    if (qTag) {
                        const range = document.createRange();
                        range.selectNode(qTag);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        document.execCommand('insertHTML', false, qTag.innerHTML);
                    } else {
                        document.execCommand('insertHTML', false, `<q>${sel.toString()}</q>`);
                    }
                    this.updateActiveStates();
                    return;
                }
            }

            if (current && value && current.toLowerCase() === value.toLowerCase()) {
                document.execCommand('formatBlock', false, 'P');
                this.updateActiveStates();
                return;
            }
        }

        if (['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].includes(command)) {
            if (document.queryCommandState(command)) {
                document.execCommand('justifyLeft', false, null);
                this.updateActiveStates();
                return;
            }
        }

        document.execCommand(command, false, value);
        this.updateActiveStates();
    }

    // ── Events & State ───────────────────────────────────────────────────────

    bindEvents() {
        document.addEventListener('selectionchange', () => {
            if (this.editor.contains(window.getSelection().anchorNode)) {
                this.updateActiveStates();
            }
        });

        this.editor.addEventListener('keyup',   () => this.updateActiveStates());
        this.editor.addEventListener('mouseup', () => this.updateActiveStates());
    }

    updateActiveStates() {
        this.container.querySelectorAll('.rte-toolbar-btn').forEach(btn => {
            const command = btn.dataset.command;
            if (!command) return;

            let isActive = false;
            if (command === 'formatBlock') {
                const val = btn.dataset.value;
                isActive = document.queryCommandValue(command).toLowerCase() === val.toLowerCase();
            } else {
                isActive = document.queryCommandState(command);
            }

            btn.classList.toggle('active', isActive);
        });
    }

    updateButtonIcon(command, icon) {
        const btn = this.container.querySelector(`button[data-command="${command}"]`);
        if (btn) btn.innerHTML = icon;
    }

    checkOverflow() {
        if (!this.container) return;
        Array.from(this.container.children)
            .filter(el => !el.classList.contains('rte-more-wrapper'))
            .forEach(el => {
                el.style.display = '';
                el.style.visibility = 'visible';
            });
        this.container.querySelector('.rte-more-wrapper')?.remove();
    }
}
