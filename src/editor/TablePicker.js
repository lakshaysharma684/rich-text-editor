export default class TablePicker {
    constructor(editor, onInsert) {
        this.editor = editor;
        this.onInsert = onInsert;
        this.modal = null;
        this.gridSize = 10; // 10x10 max
        this.init();
    }

    init() {
        this.modal = document.createElement('div');
        this.modal.className = 'rte-table-picker-modal';
        this.modal.style.display = 'none';

        // Grid HTML generation
        let gridHtml = '<div class="rte-table-grid">';
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                gridHtml += `<div class="rte-grid-cell" data-r="${r}" data-c="${c}"></div>`;
            }
        }
        gridHtml += '</div>';

        this.modal.innerHTML = `
            <div class="rte-modal-content rte-table-modal-content">
                <h3>Insert Table</h3>
                
                <!-- The Visual Grid -->
                ${gridHtml}
                
                <div class="rte-grid-label">1 x 1 Table</div>

                <div class="rte-form-group" style="margin-top: 10px; margin-bottom: 0;">
                    <label style="display:flex; align-items:center; cursor:pointer;">
                        <input type="checkbox" id="rte-tbl-header" checked style="width:auto; margin-right:8px;"> 
                        Include Header
                    </label>
                </div>
                
                <div class="rte-modal-actions">
                    <button class="rte-btn-cancel">Cancel</button>
                    <!-- No Insert button needed, click grid to insert -->
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        this.bindEvents();
    }

    bindEvents() {
        const cells = this.modal.querySelectorAll('.rte-grid-cell');
        const label = this.modal.querySelector('.rte-grid-label');

        cells.forEach(cell => {
            cell.addEventListener('mouseover', (e) => {
                const r = parseInt(e.target.dataset.r);
                const c = parseInt(e.target.dataset.c);
                this.highlightGrid(r, c);
                label.innerText = `${c + 1} x ${r + 1} Table`;
            });

            cell.addEventListener('click', (e) => {
                const r = parseInt(e.target.dataset.r);
                const c = parseInt(e.target.dataset.c);
                this.insert(r + 1, c + 1);
            });
        });

        this.modal.querySelector('.rte-btn-cancel').onclick = () => this.hide();

        // Close on background click
        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.hide();
        };
    }

    highlightGrid(maxR, maxC) {
        const cells = this.modal.querySelectorAll('.rte-grid-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);

            if (r <= maxR && c <= maxC) {
                cell.classList.add('active');
            } else {
                cell.classList.remove('active');
            }
        });
    }

    show() {
        this.modal.style.display = 'flex';
        // Reset to 1x1
        this.highlightGrid(0, 0);
    }

    hide() {
        this.modal.style.display = 'none';
    }

    insert(rows, cols) {
        const hasHeader = document.getElementById('rte-tbl-header').checked;
        this.onInsert(rows, cols, hasHeader);
        this.hide();
    }
}
