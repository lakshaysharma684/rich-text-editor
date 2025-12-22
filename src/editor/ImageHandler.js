/**
 * Handles image insertion via Drag & Drop and Paste events.
 * Converts images to Base64 and inserts them into the editor.
 */
export default class ImageHandler {
    /**
     * @param {HTMLElement} editorElement - The contenteditable element
     * @param {Object} options - Options { onFile: (file) => void }
     */
    constructor(editorElement, options = {}) {
        this.editor = editorElement;
        this.options = options;
        this.maxImageSize = 5 * 1024 * 1024; // 5MB limit example
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        this.bindEvents();
    }

    /**
     * Opens a system file picker to select an image.
     */
    pickImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = this.allowedTypes.join(',');

        input.onchange = (e) => {
            if (input.files && input.files.length > 0) {
                this.processFiles(input.files);
            }
        };

        input.click();
    }

    bindEvents() {
        this.editor.addEventListener('drop', this.handleDrop.bind(this));
        this.editor.addEventListener('paste', this.handlePaste.bind(this));
    }

    /**
     * Handle Drag & Drop of files
     * @param {DragEvent} e 
     */
    handleDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;

        if (files && files.length > 0) {
            this.processFiles(files);
        }
    }

    /**
     * Handle Paste of files (e.g. screenshots)
     * @param {ClipboardEvent} e 
     */
    handlePaste(e) {
        const items = e.clipboardData.items;
        const files = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                files.push(items[i].getAsFile());
            }
        }

        if (files.length > 0) {
            e.preventDefault(); // Prevent default paste behavior if we found images
            this.processFiles(files);
        }
    }

    /**
     * Process a list of files and insert them if valid
     * @param {FileList|Array} files 
     */
    processFiles(files) {
        Array.from(files).forEach(file => {
            if (this.allowedTypes.includes(file.type)) {

                if (file.size > this.maxImageSize) {
                    console.warn(`File size ${file.size} exceeds limit of ${this.maxImageSize} bytes.`);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.insertImage(e.target.result);
                };
                reader.readAsDataURL(file);

            } else {
                // Not a supported image, check specialized handler
                if (this.options.onFile) {
                    this.options.onFile(file);
                } else {
                    console.warn(`File type ${file.type} not supported.`);
                }
            }
        });
    }

    /**
     * Insert the Base64 image at the current cursor position
     * @param {string} src - Base64 data URL
     */
    insertImage(src) {
        // Focus the editor to ensure we have a selection
        this.editor.focus();

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Ensure we are dropping INSIDE the editor
        if (!this.editor.contains(range.commonAncestorContainer)) {
            return;
        }

        range.deleteContents();

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Inserted Image';

        range.insertNode(img);

        // Move cursor after the image
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger input event to notify listeners of change
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
