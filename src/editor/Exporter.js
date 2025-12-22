/**
 * Handles exporting editor content to various formats.
 * Loads dependencies dynamically from CDNs.
 */
export default class Exporter {
    constructor(editorElement) {
        this.editor = editorElement;
        this.turndownUrl = 'https://unpkg.com/turndown/dist/turndown.js';
        this.html2pdfUrl = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    }

    exportMarkdown() {
        this.loadScript(this.turndownUrl, 'TurndownService').then(() => {
            try {
                const turndownService = new window.TurndownService();
                const markdown = turndownService.turndown(this.editor.innerHTML);
                this.downloadFile('document.md', markdown, 'text/markdown');
            } catch (e) {
                console.error('Exporter: Error creating Markdown:', e);
                alert('Error creating Markdown. Check console for details.');
            }
        }).catch((err) => {
            console.error('Exporter: Failed to load Turndown.', err);
            alert('Failed to load Markdown converter.');
        });
    }

    exportPDF() {
        this.loadScript(this.html2pdfUrl, 'html2pdf').then(() => {
            try {
                const element = this.editor;
                const opt = {
                    margin: 1,
                    filename: 'document.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                window.html2pdf().set(opt).from(element).save();
            } catch (e) {
                console.error('Exporter: Error creating PDF:', e);
                alert('Error creating PDF. Check console for details.');
            }
        }).catch((err) => {
            console.error('Exporter: Failed to load html2pdf.', err);
            alert('Failed to load PDF generator.');
        });
    }

    loadScript(url, globalName) {
        if (!this._scriptLoadPromises) {
            this._scriptLoadPromises = {};
        }

        // Return existing promise if loading
        if (this._scriptLoadPromises[url]) {
            return this._scriptLoadPromises[url];
        }

        this._scriptLoadPromises[url] = new Promise((resolve, reject) => {
            if (window[globalName]) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                resolve();
            };
            script.onerror = () => {
                console.error(`Exporter: Script ${url} failed to load.`);
                reject(new Error(`Failed to load ${url}`));
            };
            document.head.appendChild(script);
        });

        return this._scriptLoadPromises[url];
    }

    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
