export default class ImageResizer {
    constructor(editorElement) {
        this.editor = editorElement;
        this.overlay = null;
        this.currentImg = null;
        this.isResizing = false;
        this.startDim = { w: 0, h: 0, x: 0, y: 0 };
        this.init();
    }

    init() {
        // Create Resize Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'rte-resizer-box';
        this.overlay.style.display = 'none';

        // Create Handles
        ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `rte-resizer-handle rte-handle-${pos}`;
            handle.dataset.pos = pos;
            this.overlay.appendChild(handle);
        });

        // Create Alignment Toolbar (v1.4.0)
        this.alignBar = document.createElement('div');
        this.alignBar.className = 'rte-resizer-toolbar';
        this.alignBar.innerHTML = `
            <button data-align="full" title="Full Width">↔</button>
            <button data-align="left" title="Float Left">⇠</button>
            <button data-align="center" title="Center">⇿</button>
            <button data-align="right" title="Float Right">⇢</button>
        `;
        this.overlay.appendChild(this.alignBar);

        document.body.appendChild(this.overlay);

        this.bindEvents();
    }

    bindEvents() {
        // Show overlay on image click
        this.editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.selectImage(e.target);
            } else {
                this.hide();
            }
        });

        // Hide on keyup (e.g. typing)
        this.editor.addEventListener('keyup', () => this.hide());

        // Hide on scroll (simplistic, better to update position)
        window.addEventListener('scroll', () => {
            if (this.currentImg) this.updateOverlayPosition();
        }, true);

        // Handle Dragging
        this.overlay.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('rte-resizer-handle')) {
                e.preventDefault();
                e.stopPropagation();
                this.startResize(e);
            }
        });

        // Handle Alignment (v1.4.0)
        this.alignBar.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn || !this.currentImg) return;
            e.preventDefault();
            e.stopPropagation();

            const align = btn.dataset.align;
            this.applyAlignment(align);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isResizing) this.resize(e);
        });

        document.addEventListener('mouseup', () => {
            this.stopResize();
        });
    }

    applyAlignment(align) {
        if (!this.currentImg) return;

        // Reset
        this.currentImg.style.float = '';
        this.currentImg.style.display = 'block';
        this.currentImg.style.margin = '1em auto';
        this.currentImg.style.width = '';

        if (align === 'full') {
            this.currentImg.style.width = '100%';
        } else if (align === 'left') {
            this.currentImg.style.float = 'left';
            this.currentImg.style.display = 'inline';
            this.currentImg.style.margin = '0 1em 1em 0';
        } else if (align === 'right') {
            this.currentImg.style.float = 'right';
            this.currentImg.style.display = 'inline';
            this.currentImg.style.margin = '0 0 1em 1em';
        } else if (align === 'center') {
            // Already set by default block + margin auto
        }

        this.updateOverlayPosition();
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    selectImage(img) {
        this.currentImg = img;
        this.updateOverlayPosition();
        this.overlay.style.display = 'block';
    }

    hide() {
        this.overlay.style.display = 'none';
        this.currentImg = null;
    }

    updateOverlayPosition() {
        if (!this.currentImg) return;
        const rect = this.currentImg.getBoundingClientRect();

        this.overlay.style.top = (rect.top + window.scrollY) + 'px';
        this.overlay.style.left = (rect.left + window.scrollX) + 'px';
        this.overlay.style.width = rect.width + 'px';
        this.overlay.style.height = rect.height + 'px';
    }

    startResize(e) {
        this.isResizing = true;
        this.handle = e.target.dataset.pos;
        const rect = this.currentImg.getBoundingClientRect();
        this.startDim = {
            w: rect.width,
            h: rect.height,
            x: e.clientX,
            y: e.clientY,
            ratio: rect.width / rect.height
        };
    }

    resize(e) {
        if (!this.isResizing || !this.currentImg) return;

        let deltaX = e.clientX - this.startDim.x;
        let deltaY = e.clientY - this.startDim.y;

        let newWidth = this.startDim.w;
        let newHeight = this.startDim.h;

        // Logic depending on handle
        if (this.handle.includes('e')) newWidth += deltaX;
        if (this.handle.includes('w')) newWidth -= deltaX;
        if (this.handle.includes('s')) newHeight += deltaY;
        if (this.handle.includes('n')) newHeight -= deltaY;

        // Aspect Ratio Locking (v1.4.0)
        if (e.shiftKey) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                newHeight = newWidth / this.startDim.ratio;
            } else {
                newWidth = newHeight * this.startDim.ratio;
            }
        }

        // Min dimensions
        if (newWidth < 20) newWidth = 20;
        if (newHeight < 20) newHeight = 20;

        this.currentImg.style.width = newWidth + 'px';
        this.currentImg.style.height = newHeight + 'px';

        this.updateOverlayPosition();
    }

    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            // Trigger input event
            this.editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
}
