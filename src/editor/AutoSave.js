/**
 * AutoSave module for Rich Text Editor
 * Automatically saves content to localStorage to prevent data loss.
 */
export default class AutoSave {
    /**
     * @param {HTMLElement} editorElement - The contenteditable element
     * @param {string} storageKey - Unique key for localStorage
     * @param {Object} options - Configuration options
     */
    constructor(editorElement, storageKey, options = {}) {
        this.editor = editorElement;
        this.key = `rte_autosave_${storageKey || 'default'}`;
        this.options = {
            debounceTime: 1000, // 1 second
            ...options
        };

        this.timeout = null;
        this.init();
    }

    init() {
        this.restore();
        this.bindEvents();
    }

    bindEvents() {
        this.editor.addEventListener('input', () => {
            this.debounceSave();
        });
    }

    debounceSave() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.save();
        }, this.options.debounceTime);
    }

    save() {
        const content = this.editor.innerHTML;
        if (!content) return;

        try {
            localStorage.setItem(this.key, content);
            this.showSavedIndicator();
        } catch (e) {
            console.warn('RichTextEditor: AutoSave failed to write to localStorage', e);
        }
    }

    restore() {
        const saved = localStorage.getItem(this.key);
        if (saved && saved.trim().length > 0) {
            if (saved && saved.trim().length > 0) {
                // Restore content.
                // Ideally we check if it's different from current, but for now we prioritize saved work.
                if (saved !== this.editor.innerHTML) {
                    this.editor.innerHTML = saved;
                    console.log('RichTextEditor: Content restored from auto-save');
                }
            }
        }
    }

    showSavedIndicator() {
        // Optional: Dispatch event so main editor can show a status
        const event = new CustomEvent('rte-autosave', { detail: { timestamp: new Date() } });
        this.editor.dispatchEvent(event);
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}
