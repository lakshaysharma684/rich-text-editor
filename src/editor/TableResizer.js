export default class TableResizer {
    constructor(editorElement) {
        this.editor = editorElement;
        this.resizer = null;
        this.currentTable = null;
        this.currentCell = null;
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        this.init();
    }

    init() {
        // Create Resizer Handle
        this.resizer = document.createElement('div');
        this.resizer.className = 'rte-table-resizer-handle';
        this.resizer.style.display = 'none';
        document.body.appendChild(this.resizer);

        this.bindEvents();
    }

    bindEvents() {
        this.editor.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        this.resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startResize(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isResizing) this.resize(e);
        });

        document.addEventListener('mouseup', () => {
            if (this.isResizing) this.stopResize();
        });

        // Hide handle when leaving editor
        this.editor.addEventListener('mouseleave', () => {
            if (!this.isResizing) this.resizer.style.display = 'none';
        });
    }

    handleMouseMove(e) {
        if (this.isResizing) return;

        const cell = e.target.closest('td, th');
        if (!cell) {
            this.resizer.style.display = 'none';
            return;
        }

        const rect = cell.getBoundingClientRect();
        const mouseX = e.clientX;
        const threshold = 10; // Pixels from right border to show handle

        if (rect.right - mouseX < threshold) {
            this.currentCell = cell;
            this.currentTable = cell.closest('table');
            this.showHandle(rect);
        } else {
            this.resizer.style.display = 'none';
        }
    }

    showHandle(rect) {
        this.resizer.style.display = 'block';
        this.resizer.style.top = (rect.top + window.scrollY) + 'px';
        this.resizer.style.left = (rect.right + window.scrollX - 2) + 'px';
        this.resizer.style.height = rect.height + 'px';
    }

    startResize(e) {
        this.isResizing = true;
        this.startX = e.clientX;
        this.startWidth = this.currentCell.offsetWidth;
        this.resizer.classList.add('active');
        
        // Ensure table has fixed layout to maintain ratios
        if (this.currentTable) {
            this.currentTable.style.tableLayout = 'fixed';
        }
    }

    resize(e) {
        if (!this.isResizing || !this.currentCell) return;

        const deltaX = e.clientX - this.startX;
        const newWidth = Math.max(30, this.startWidth + deltaX);
        
        this.currentCell.style.width = newWidth + 'px';
        
        // Update handle position
        const rect = this.currentCell.getBoundingClientRect();
        this.resizer.style.left = (rect.right + window.scrollX - 2) + 'px';
    }

    stopResize() {
        this.isResizing = false;
        this.resizer.classList.remove('active');
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
