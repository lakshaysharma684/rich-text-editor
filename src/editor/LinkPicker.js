export default class LinkPicker {
    constructor(editor, onInsert) {
        this.editor = editor;
        this.onInsert = onInsert;
        this.modal = null;
        this.init();
    }

    init() {
        this.modal = document.createElement('div');
        this.modal.className = 'rte-link-picker-modal';
        this.modal.style.display = 'none';

        this.modal.innerHTML = `
            <div class="rte-modal-content">
                <h3>Insert Link</h3>
                
                <div class="rte-form-group">
                    <label>URL</label>
                    <input type="text" id="rte-link-url" placeholder="https://example.com" />
                </div>

                <div class="rte-form-group">
                    <label>Text to Display</label>
                    <input type="text" id="rte-link-text" placeholder="Link Text" />
                </div>
                
                <div class="rte-form-group" style="margin-bottom:0">
                    <label style="display:flex;align-items:center;cursor:pointer">
                        <input type="checkbox" id="rte-link-target" style="width:auto;margin-right:8px"> 
                        Open in new tab
                    </label>
                </div>

                <div class="rte-modal-actions">
                    <button class="rte-btn-cancel">Cancel</button>
                    <button class="rte-btn-insert">Insert Link</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.bindEvents();
    }

    bindEvents() {
        const urlInput = this.modal.querySelector('#rte-link-url');
        const textInput = this.modal.querySelector('#rte-link-text');
        const targetInput = this.modal.querySelector('#rte-link-target');
        const insertBtn = this.modal.querySelector('.rte-btn-insert');
        const cancelBtn = this.modal.querySelector('.rte-btn-cancel');

        const insert = () => {
            const url = urlInput.value.trim();
            const text = textInput.value;
            const openInNewTab = targetInput.checked;

            if (!url) {
                urlInput.style.borderColor = 'red';
                return;
            }

            this.onInsert(url, text, openInNewTab);
            this.hide();
        };

        insertBtn.onclick = insert;

        // Enter key in inputs
        urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') insert(); });
        textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') insert(); });

        cancelBtn.onclick = () => this.hide();

        // Close on background click
        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.hide();
        };
    }

    show(currentUrl = '', currentText = '') {
        const urlInput = this.modal.querySelector('#rte-link-url');
        const textInput = this.modal.querySelector('#rte-link-text');
        const targetInput = this.modal.querySelector('#rte-link-target');

        // Reset styles
        urlInput.style.borderColor = '#cbd5e1';

        // Pre-fill
        urlInput.value = currentUrl || 'https://';
        textInput.value = currentText;

        // If updating an existing link, we might not want to change text unless user explicitly does.
        // But if inserting new, text is important.

        this.modal.style.display = 'flex';
        urlInput.focus();
    }

    hide() {
        this.modal.style.display = 'none';
    }
}
