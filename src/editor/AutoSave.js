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
            localStorage.setItem(this.key + '_ts', Date.now().toString());
            this.showSavedIndicator();
        } catch (e) {
            console.warn('RichTextEditor: AutoSave failed to write to localStorage', e);
        }
    }

    restore() {
        const saved = localStorage.getItem(this.key);
        const ts = localStorage.getItem(this.key + '_ts');
        if (!saved || !saved.trim() || saved === this.editor.innerHTML) return;
        const ageMin = ts ? Math.round((Date.now() - parseInt(ts)) / 60000) : null;
        const ageStr = ageMin !== null ? `${ageMin} min ago` : 'earlier';
        const banner = document.createElement('div');
        banner.className = 'rte-restore-banner';
        banner.style.cssText = 'padding:10px 16px;background:#fef9c3;border:1px solid #fbbf24;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;gap:12px;font-size:13px;flex-wrap:wrap;';
        banner.innerHTML = `
            <span>⚠️ Unsaved draft found from <strong>${ageStr}</strong>.</span>
            <button id="rte-restore-yes" style="background:#2563eb;color:#fff;border:none;border-radius:4px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:600;">Restore Draft</button>
            <button id="rte-restore-no" style="background:transparent;border:1px solid #9ca3af;border-radius:4px;padding:4px 12px;cursor:pointer;font-size:12px;">Discard</button>
        `;
        this.editor.parentNode.insertBefore(banner, this.editor);
        banner.querySelector('#rte-restore-yes').onclick = () => {
            this.editor.innerHTML = saved;
            banner.remove();
        };
        banner.querySelector('#rte-restore-no').onclick = () => {
            this.clear();
            banner.remove();
        };
    }

    showSavedIndicator() {
        // Optional: Dispatch event so main editor can show a status
        const event = new CustomEvent('rte-autosave', { detail: { timestamp: new Date() } });
        this.editor.dispatchEvent(event);
    }

    clear() {
        localStorage.removeItem(this.key);
        localStorage.removeItem(this.key + '_ts');
    }
}
