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

        document.addEventListener('mousemove', (e) => {
            if (this.isResizing) this.resize(e);
        });

        document.addEventListener('mouseup', () => {
            this.stopResize();
        });
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
            y: e.clientY
        };
    }

    resize(e) {
        if (!this.isResizing || !this.currentImg) return;

        let deltaX = e.clientX - this.startDim.x;
        let deltaY = e.clientY - this.startDim.y;

        // Lock aspect ratio? Optional. For now free resize or shift-key could lock.
        // Let's keep it simple: Width driven mostly.

        let newWidth = this.startDim.w;
        let newHeight = this.startDim.h;

        // Logic depending on handle
        if (this.handle.includes('e')) newWidth += deltaX;
        if (this.handle.includes('w')) newWidth -= deltaX;
        if (this.handle.includes('s')) newHeight += deltaY;
        if (this.handle.includes('n')) newHeight -= deltaY;

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
