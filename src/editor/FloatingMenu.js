/**
 * Handles contextual floating menus for Images and Links.
 */
export default class FloatingMenu {
    constructor(editorElement) {
        this.editor = editorElement;
        this.menu = null;
        this.currentTarget = null;

        this.init();
    }

    init() {
        // Create menu DOM
        this.menu = document.createElement('div');
        this.menu.className = 'rte-floating-menu';
        this.menu.style.display = 'none';
        document.body.appendChild(this.menu);

        this.bindEvents();
    }

    bindEvents() {
        this.editor.addEventListener('click', (e) => this.checkTarget(e.target));
        this.editor.addEventListener('keyup', () => this.hide());

        // Hide when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target) && !this.editor.contains(e.target)) {
                this.hide();
            }
        });

        // Update position on scroll
        window.addEventListener('scroll', () => {
            if (this.currentTarget) this.updatePosition();
        }, true);
    }

    checkTarget(target) {
        // Check for Image
        if (target.tagName === 'IMG') {
            this.showImageMenu(target);
            return;
        }

        // Check for Link
        const link = target.closest('a');
        if (link && this.editor.contains(link)) {
            this.showLinkMenu(link);
            return;
        }

        // Check for Table Cell
        const cell = target.closest('td');
        if (cell && this.editor.contains(cell)) {
            this.showTableMenu(cell);
            return;
        }

        this.hide();
    }

    showImageMenu(img) {
        this.currentTarget = img;
        this.menu.innerHTML = '';

        const actions = [
            { label: '⇤', title: 'Align Left', action: () => this.alignImage(img, 'left') },
            { label: '⇹', title: 'Align Center', action: () => this.alignImage(img, 'center') },
            { label: '⇥', title: 'Align Right', action: () => this.alignImage(img, 'right') },
            { label: 'S', title: 'Small (25%)', action: () => this.resizeImage(img, '25%') },
            { label: 'M', title: 'Medium (50%)', action: () => this.resizeImage(img, '50%') },
            { label: 'L', title: 'Full (100%)', action: () => this.resizeImage(img, '100%') },
            { label: '🗑', title: 'Remove', action: () => { img.remove(); this.hide(); } }
        ];

        actions.forEach(item => {
            const btn = document.createElement('button');
            btn.innerHTML = item.label;
            btn.title = item.title;
            btn.onclick = (e) => {
                e.stopPropagation(); // prevent menu closing immediately
                item.action();
            };
            this.menu.appendChild(btn);
        });

        this.show();
    }

    showLinkMenu(link) {
        this.currentTarget = link;
        this.menu.innerHTML = '';

        // Show URL
        const urlSpan = document.createElement('span');
        urlSpan.className = 'rte-menu-url';
        urlSpan.textContent = link.href.length > 20 ? link.href.substring(0, 20) + '...' : link.href;
        this.menu.appendChild(urlSpan);

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.title = 'Edit Link';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            const newUrl = prompt('Edit Link URL:', link.href);
            if (newUrl) {
                link.href = newUrl;
                this.hide();
            }
        };
        this.menu.appendChild(editBtn);

        // Unlink Button
        const unlinkBtn = document.createElement('button');
        unlinkBtn.textContent = '🔗⃠';
        unlinkBtn.title = 'Remove Link';
        unlinkBtn.onclick = (e) => {
            e.stopPropagation();
            // Unwrap link
            const parent = link.parentNode;
            while (link.firstChild) parent.insertBefore(link.firstChild, link);
            parent.removeChild(link);
            this.hide();
        };
        this.menu.appendChild(unlinkBtn);

        this.show();
    }

    showTableMenu(cell) {
        this.currentTarget = cell;
        this.menu.innerHTML = '';

        // Actions: Row+, Col+, Row-, Col-, Table-
        const actions = [
            { label: '+Row', title: 'Insert Row Below', action: () => this.modifyTable(cell, 'addRow') },
            { label: '+Col', title: 'Insert Column Right', action: () => this.modifyTable(cell, 'addCol') },
            { label: '-Row', title: 'Delete Row', action: () => this.modifyTable(cell, 'delRow') },
            { label: '-Col', title: 'Delete Column', action: () => this.modifyTable(cell, 'delCol') },
            { label: '🗑', title: 'Delete Table', action: () => this.modifyTable(cell, 'delTable') }
        ];

        actions.forEach(item => {
            const btn = document.createElement('button');
            btn.innerHTML = item.label;
            btn.title = item.title;
            btn.onclick = (e) => {
                e.stopPropagation();
                item.action();
            };
            this.menu.appendChild(btn);
        });

        this.show();
    }

    modifyTable(cell, action) {
        const row = cell.parentElement;
        const table = row.parentElement.closest('table'); // tbody?
        const rowIndex = row.rowIndex;
        const colIndex = cell.cellIndex;

        if (action === 'addRow') {
            const newRow = table.insertRow(rowIndex + 1);
            const cols = row.cells.length;
            for (let i = 0; i < cols; i++) {
                const newCell = newRow.insertCell(i);
                newCell.style.border = '1px solid #ccc';
                newCell.style.padding = '8px';
                newCell.innerHTML = '&nbsp;';
            }
        } else if (action === 'addCol') {
            for (let i = 0; i < table.rows.length; i++) {
                const newCell = table.rows[i].insertCell(colIndex + 1);
                newCell.style.border = '1px solid #ccc';
                newCell.style.padding = '8px';
                newCell.innerHTML = '&nbsp;';
            }
        } else if (action === 'delRow') {
            table.deleteRow(rowIndex);
        } else if (action === 'delCol') {
            for (let i = 0; i < table.rows.length; i++) {
                table.rows[i].deleteCell(colIndex);
            }
        } else if (action === 'delTable') {
            table.remove();
        }

        if (table.rows.length === 0 && action !== 'delTable') {
            table.remove();
        }

        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
        this.hide();
    }

    alignImage(img, align) {
        // Reset styles
        img.style.float = 'none';
        img.style.display = 'block';
        img.style.margin = '0';

        if (align === 'left') {
            img.style.float = 'left';
            img.style.marginRight = '10px';
        } else if (align === 'right') {
            img.style.float = 'right';
            img.style.marginLeft = '10px';
        } else if (align === 'center') {
            img.style.display = 'block';
            img.style.margin = '0 auto';
        }

        // Trigger input to ensure change is saved
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
        this.hide();
    }

    resizeImage(img, width) {
        img.style.width = width;
        img.style.height = 'auto';
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
        this.hide();
    }

    show() {
        this.menu.style.display = 'flex';
        this.updatePosition();
    }

    hide() {
        this.menu.style.display = 'none';
        this.currentTarget = null;
    }

    updatePosition() {
        if (!this.currentTarget) return;

        const rect = this.currentTarget.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();

        // Position above the element
        let top = rect.top + window.scrollY - menuRect.height - 8;
        let left = rect.left + window.scrollX + (rect.width / 2) - (menuRect.width / 2);

        // Keep within viewport
        if (top < 0) top = rect.bottom + window.scrollY + 8; // flip to bottom if offscreen top
        if (left < 0) left = 10;

        this.menu.style.top = `${top}px`;
        this.menu.style.left = `${left}px`;
    }
}
