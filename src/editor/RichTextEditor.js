import Toolbar from './Toolbar.js?v=1.4.0';
import ImageHandler from './ImageHandler.js?v=1.4.0';
import FloatingMenu from './FloatingMenu.js?v=1.4.0';
import MarkdownShortcuts from './MarkdownShortcuts.js?v=1.4.0';
import PasteSanitizer from './PasteSanitizer.js?v=1.4.0';
import EmojiPicker from './EmojiPicker.js?v=1.4.0';
import TablePicker from './TablePicker.js?v=1.4.0';
import ImageResizer from './ImageResizer.js?v=1.4.0';
import SearchReplace from './SearchReplace.js?v=1.4.0';
import AutoSave from './AutoSave.js?v=1.4.0';
import LinkTooltip from './LinkTooltip.js?v=1.4.0';
import SlashMenu from './SlashMenu.js?v=1.4.0';
import CodeHighlighter from './CodeHighlighter.js?v=1.4.0';
import LinkPicker from './LinkPicker.js?v=1.4.0';
import FileImporter from './FileImporter.js?v=1.4.0';
import TableResizer from './TableResizer.js?v=1.4.0';


import Exporter from './Exporter.js';


export default class RichTextEditor {
    /**
     * @param {HTMLElement|string} target - The DOM element or selector to replace with the editor
     * @param {Object} options - Configuration options
     */
    constructor(target, options = {}) {
        this.target = typeof target === 'string' ? document.querySelector(target) : target;
        this.options = {
            placeholder: 'Start typing...',
            enableAutoSave: true,
            autoSaveKey: null, // Custom key for local storage
            customButtons: [], // New in v1.4.0
            ...options
        };

        this.customCommands = {}; // Store custom command callbacks

        if (!this.target) {
            throw new Error('RichTextEditor: Target element not found');
        }

        this.init();
    }

    init() {
        // Create the structure
        this.createStructure();

        // Initialize modules
        this.fileImporter = new FileImporter(this.editorElement); // Init first so we can use it
        this.exporter = new Exporter(this.editorElement);

        this.imageHandler = new ImageHandler(this.editorElement, {
            onFile: (file) => {
                if (file.name.endsWith('.docx')) {
                    this.fileImporter.processFile(file);
                }
            }
        });



        this.toolbar = new Toolbar(this.toolbarElement, this.editorElement, {
            onImageClick: () => this.imageHandler.pickImage(),
            onLinkClick: () => this.openLinkPicker(), // New handler
            onCustomCommand: (cmd, val, target) => this.handleCommand(cmd, val, target),
            customButtons: this.options.customButtons // Pass to toolbar
        });

        this.floatingMenu = new FloatingMenu(this.editorElement);
        this.markdown = new MarkdownShortcuts(this.editorElement);
        this.sanitizer = new PasteSanitizer(this.editorElement);
        this.emojiPicker = new EmojiPicker(this.editorElement);
        this.tablePicker = new TablePicker(this.editorElement, (rows, cols, hasHeader) => {
            this.editorElement.focus();
            this.insertTable(rows, cols, hasHeader);
        });
        this.imageResizer = new ImageResizer(this.editorElement);
        this.tableResizer = new TableResizer(this.editorElement);
        this.searchReplace = new SearchReplace(this.editorElement);
        this.linkTooltip = new LinkTooltip(this.editorElement, (linkNode) => {
            // Pick Link with prefiltered values from this node
            const range = document.createRange();
            range.selectNodeContents(linkNode); // Select text inside link
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

            this.openLinkPicker();
        });
        this.linkPicker = new LinkPicker(this.editorElement, (url, text, openInNewTab) => {
            this.insertLink(url, text, openInNewTab);
        });

        this.slashMenu = new SlashMenu(this.editorElement, {
            onCustom: (action) => {
                if (action === 'image') this.imageHandler.pickImage();
                if (action === 'table') this.tablePicker.show();
            }
        });
        this.codeHighlighter = new CodeHighlighter(this.editorElement);
        // this.fileImporter moved to top

        if (this.options.enableAutoSave) {
            // Use provided key or fallback to a hash of the selector/page
            const key = this.options.autoSaveKey || window.location.pathname + (typeof this.target === 'string' ? this.target : 'rte');
            this.autoSave = new AutoSave(this.editorElement, key);

            this.editorElement.addEventListener('rte-autosave', () => {
                this.updateStatus('Saved locally');
            });
        }

        // Initial setup
        this.editorElement.focus();

        // Keyboard Shortcuts (v1.4.0)
        this.editorElement.addEventListener('keydown', (e) => {
            // Ctrl+Shift+V = Paste as plain text (existing)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'v') {
                e.preventDefault();
                navigator.clipboard.readText()
                    .then(text => document.execCommand('insertText', false, text))
                    .catch(() => {});
                return;
            }

            // Ctrl+K / Cmd+K = Open Link Picker
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openLinkPicker();
                return;
            }

            // Alt+1 to Alt+6 = H1 to H6
            if (e.altKey && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                this.handleCommand('formatBlock', `H${e.key}`);
                return;
            }

            // Alt+0 = Paragraph
            if (e.altKey && e.key === '0') {
                e.preventDefault();
                this.handleCommand('formatBlock', 'P');
                return;
            }

            // Ctrl+Enter = Exit Blockquote/List
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                const block = (container.nodeType === 3 ? container.parentNode : container).closest('blockquote, ul, ol');
                
                if (block) {
                    e.preventDefault();
                    // Insert a paragraph after the block
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    block.parentNode.insertBefore(p, block.nextSibling);
                    
                    // Move cursor to new paragraph
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
        });
    }

    handleCommand(command, value, target) {
        // Check for Custom Registered Commands first (v1.4.0)
        if (this.customCommands[command]) {
            this.customCommands[command](this, value, target);
            return;
        }

        if (command === 'toggleFullScreen') {
            this.wrapper.classList.toggle('rte-fullscreen');
            return;
        }

        if (command === 'toggleSearch') {
            this.searchReplace.toggle();
            return;
        }

        if (command === 'toggleSource') {
            this.toggleSourceByView();
            return;
        }

        if (command === 'customFontSize') {
            this.setFontSize(value);
            return;
        }

        if (command === 'toggleTheme') {
            this.toggleTheme();
            return;
        }

        if (command === 'insertEmoji') {
            const rect = target.getBoundingClientRect();
            this.emojiPicker.toggle(rect);
            return;
        }

        if (command === 'insertVideo') {
            const url = prompt('Enter YouTube/Vimeo URL:', '');
            if (url) this.insertVideo(url);
            return;
        }

        if (command === 'insertTable') {
            this.tablePicker.show();
            return;
        }

        if (command === 'customImport') {
            this.fileImporter.importRequest();
            return;
        }

        if (command === 'exportMarkdown') {
            this.exporter.exportMarkdown();
            return;
        }

        if (command === 'exportPDF') {
            this.exporter.exportPDF();
            return;
        }
    }

    toggleSourceByView() {
        if (this.isSourceMode) {
            // Switch BACK to Visual Editor
            // 1. Get code from textarea
            const html = this.sourceTextarea.value;
            // 2. Set it to editor
            this.editorElement.innerHTML = html;
            // 3. Toggle visibility
            this.sourceTextarea.style.display = 'none';
            this.editorElement.style.display = 'block';
            this.editorElement.focus();
            this.isSourceMode = false;
        } else {
            // Switch TO Source Mode
            // Create textarea if not exists
            if (!this.sourceTextarea) {
                this.sourceTextarea = document.createElement('textarea');
                this.sourceTextarea.className = 'rte-source-view';
                this.wrapper.insertBefore(this.sourceTextarea, this.statusBar); // Insert before status, after content
            }

            // 1. Get HTML
            const html = this.editorElement.innerHTML;
            // 2. Format it slightly for readability (optional)
            this.sourceTextarea.value = html; // or use a beautifier if allowed

            // 3. Toggle visibility
            this.editorElement.style.display = 'none';
            this.sourceTextarea.style.display = 'block';
            this.sourceTextarea.focus();
            this.isSourceMode = true;
        }
    }

    setFontSize(size) {
        if (!size) return;
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('fontSize', false, '7');
        document.execCommand('styleWithCSS', false, false);
        this.editorElement
            .querySelectorAll('font[size="7"], span[style*="xxx-large"], span[style*="-webkit-xxx-large"]')
            .forEach(el => {
                if (el.tagName === 'FONT') {
                    const span = document.createElement('span');
                    span.style.fontSize = size;
                    span.innerHTML = el.innerHTML;
                    el.parentNode.replaceChild(span, el);
                } else {
                    el.style.fontSize = size;
                }
            });
        this.editorElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    toggleTheme() {
        this.wrapper.classList.toggle('rte-dark-mode');
        this.isDarkMode = this.wrapper.classList.contains('rte-dark-mode');

        // Update Flash Menu Theme
        if (this.slashMenu && this.slashMenu.menu) {
            this.slashMenu.menu.classList.toggle('dark', this.isDarkMode);
        }

        // Update Icon
        const icon = this.isDarkMode ? '☀️' : '🌙';
        this.toolbar.updateButtonIcon('toggleTheme', icon);
    }

    insertVideo(url) {
        // Basic YouTube ID extraction for demo
        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        const iframe = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1em 0;">
      <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
    </div>`;
        document.execCommand('insertHTML', false, iframe);
    }

    insertTable(rows, cols, hasHeader) {
        // Support legacy string format if needed, or just assume new format
        if (typeof rows === 'string') {
            const parts = rows.split(',');
            rows = parseInt(parts[0]);
            cols = parseInt(parts[1]);
            hasHeader = false;
        }

        if (!rows || !cols) return;

        let html = '<table style="width:100%;border-collapse:collapse;margin:1em 0;">';

        if (hasHeader) {
            html += '<thead><tr>';
            for (let c = 0; c < cols; c++) {
                html += `<th style="border:1px solid #ccc;padding:8px;background:#f8fafc;font-weight:bold;">Header ${c + 1}</th>`;
            }
            html += '</tr></thead><tbody>';
        } else {
            html += '<tbody>';
        }

        for (let r = 0; r < rows; r++) {
            html += '<tr>';
            for (let c = 0; c < cols; c++) {
                html += `<td style="border:1px solid #ccc;padding:8px;">Cell ${r + 1}-${c + 1}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table><p></p>';
        document.execCommand('insertHTML', false, html);
    }
    openLinkPicker() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.savedRange = selection.getRangeAt(0);
        } else {
            this.savedRange = null;
        }

        let currentText = '';
        let currentUrl = '';

        // If selection is a link or inside a link, prefill
        if (this.savedRange) {
            const container = this.savedRange.commonAncestorContainer;
            const node = container.nodeType === 3 ? container.parentNode : container;
            const link = node.closest('a');

            if (link) {
                currentUrl = link.href;
                currentText = link.innerText;
                // Expand selection to whole link if we are inside it
                const range = document.createRange();
                range.selectNode(link);
                this.savedRange = range;
            } else {
                currentText = this.savedRange.toString();
            }
        }

        this.linkPicker.show(currentUrl, currentText);
    }

    insertLink(url, text, openInNewTab) {
        this.editorElement.focus();

        if (this.savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.savedRange);
        }

        // If text provided and different from selection, we might need to be smart.
        // Simple case: HTML insert
        let html = `<a href="${url}"`;
        if (openInNewTab) html += ' target="_blank"';
        html += `>${text || url}</a>`;

        // If we were editing an existing link, this execCommand might nest them or fail.
        // Safer: execCommand('createLink') but that doesn't supporting targets well across browsers easily without selection games.
        // Let's stick to insertHTML which overwrites selection.
        document.execCommand('insertHTML', false, html);

        this.savedRange = null;
    }

    createStructure() {
        // preserve original content if any
        const initialContent = this.target.value || this.target.innerHTML || '';

        // Create wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'rte-wrapper';

        // Create Toolbar container
        this.toolbarElement = document.createElement('div');
        this.toolbarElement.className = 'rte-toolbar';

        // Create Editable Content area
        this.editorElement = document.createElement('div');
        this.editorElement.className = 'rte-content';
        this.editorElement.contentEditable = true;
        this.editorElement.setAttribute('role', 'textbox');
        this.editorElement.setAttribute('aria-multiline', 'true');
        this.editorElement.setAttribute('data-placeholder', this.options.placeholder);
        this.editorElement.innerHTML = initialContent;

        // Assemble
        this.wrapper.appendChild(this.toolbarElement);
        this.wrapper.appendChild(this.editorElement);

        // Create & Append Status Bar
        this.createStatusBar();

        // Replace target with new editor
        // We hide the original target (e.g., if it was a textarea) to keep form compatibility if needed later,
        // but for now, we just replace it in the visual DOM.
        this.target.parentElement.insertBefore(this.wrapper, this.target);
        this.target.style.display = 'none';
    }

    createStatusBar() {
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'rte-statusbar';
        this.statusBar.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; display: flex; justify-content: flex-end; gap: 12px;';
        this.statusBar.innerHTML = '<span>0 words</span><span>0 chars</span>';

        this.wrapper.appendChild(this.statusBar);

        this.editorElement.addEventListener('input', () => this.updateStats());
        // Also update on init
        this.updateStats();
    }

    updateStats() {
        const text = this.editorElement.innerText || '';
        const charCount = text.length;
        // Simple word count: split by whitespace and filter empty
        const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

        this.statusBar.innerHTML = `<span>${wordCount} words</span><span>${charCount} chars</span> <span class="rte-status-msg" style="margin-left:auto;font-style:italic;opacity:0.7"></span>`;
    }

    updateStatus(msg) {
        const msgEl = this.statusBar.querySelector('.rte-status-msg');
        if (msgEl) {
            msgEl.innerText = msg;
            setTimeout(() => { msgEl.innerText = ''; }, 2000);
        }
    }

    /**
     * Get the generated HTML
     * @returns {string} Can be saved to DB
     */
    /**
     * Get validated and minified HTML
     * @returns {string} Minified HTML
     */
    getHTML(minify = false) {
        if (!minify) return this.editorElement.innerHTML;

        let html = this.editorElement.innerHTML;

        // 1. Remove comments
        html = html.replace(/<!--[\s\S]*?-->/g, "");

        // 2. Protect <pre> blocks
        const parts = html.split(/(<pre[\s\S]*?<\/pre>)/gi);

        const minified = parts.map(part => {
            if (part.toLowerCase().startsWith('<pre')) {
                // Keep pre content as is, maybe trim edges
                return part;
            }
            // Collapse all whitespace to single spaces
            // This mimics browser rendering for non-pre whitespace
            return part.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
        }).join('');

        return minified;
    }

    /**
     * Set HTML content
     * @param {string} html 
     */
    setHTML(html) {
        this.editorElement.innerHTML = html;
    }

    /**
     * Clear content
     */
    clear() {
        this.editorElement.innerHTML = '';
    }

    /**
     * Register a custom command (v1.4.0)
     * @param {string} name 
     * @param {function} callback 
     */
    registerCommand(name, callback) {
        this.customCommands[name] = callback;
    }
}
