/**
 * LinkTooltip module
 * Shows a floating tooltip on link hover to view/edit/remove links.
 */
export default class LinkTooltip {
    constructor(editorElement, onEdit) {
        this.editor = editorElement;
        this.onEdit = onEdit;
        this.tooltip = null;
        this.currentLink = null;
        this.init();
    }

    init() {
        this.createTooltip();
        this.bindEvents();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'rte-link-tooltip';
        this.tooltip.style.display = 'none';

        // Structure: Link URL | Edit | Unlink
        this.tooltip.innerHTML = `
            <a href="#" class="rte-tooltip-link" target="_blank"></a>
            <div class="rte-tooltip-actions">
                <button class="rte-tooltip-btn edit" title="Edit Link">✏️</button>
                <button class="rte-tooltip-btn unlink" title="Remove Link">❌</button>
            </div>
        `;

        document.body.appendChild(this.tooltip);

        // Bind tooltip actions
        this.tooltip.querySelector('.edit').addEventListener('click', (e) => {
            e.preventDefault();
            this.editLink();
        });

        this.tooltip.querySelector('.unlink').addEventListener('click', (e) => {
            e.preventDefault();
            this.unlink();
        });
    }

    bindEvents() {
        this.editor.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'A') {
                this.show(e.target);
            }
        });

        document.addEventListener('click', (e) => {
            // Hide if clicking outside tooltip and outside a link
            if (!this.tooltip.contains(e.target) && e.target.tagName !== 'A') {
                this.hide();
            }
        });

        // Hide on scroll
        window.addEventListener('scroll', () => this.hide(), true);
    }

    show(linkNode) {
        this.currentLink = linkNode;
        const url = linkNode.href;

        const linkEl = this.tooltip.querySelector('.rte-tooltip-link');
        linkEl.href = url;
        linkEl.innerText = url.length > 30 ? url.substring(0, 27) + '...' : url;

        // Position
        const rect = linkNode.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        this.tooltip.style.display = 'flex';
        this.tooltip.style.top = `${rect.bottom + scrollTop + 5}px`;
        this.tooltip.style.left = `${rect.left + scrollLeft}px`;
    }

    hide() {
        this.tooltip.style.display = 'none';
        this.currentLink = null;
    }

    editLink() {
        if (!this.currentLink) return;

        if (this.onEdit) {
            this.onEdit(this.currentLink);
            this.hide();
            return;
        }

        const newUrl = prompt('Edit Link URL:', this.currentLink.href);
        if (newUrl) {
            this.currentLink.href = newUrl;
            this.hide();
        }
    }

    unlink() {
        if (!this.currentLink) return;

        // Move children out of link and remove link
        const parent = this.currentLink.parentNode;
        while (this.currentLink.firstChild) {
            parent.insertBefore(this.currentLink.firstChild, this.currentLink);
        }
        parent.removeChild(this.currentLink);
        this.hide();
    }
}
