export default class FileImporter {
    constructor(editorElement) {
        this.editor = editorElement;
        this.mammothUrl = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        this.isLoaded = false;
    }

    importRequest() {
        this.loadMammoth().then(() => {
            this.pickFile();
        }).catch(err => {
            console.error('Failed to load importer:', err);
            alert('Could not load the import library. Please check your internet connection.');
        });
    }

    loadMammoth() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded || window.mammoth) {
                this.isLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = this.mammothUrl;
            script.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            script.onerror = () => reject();
            document.head.appendChild(script);
        });
    }

    pickFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.docx';
        input.style.display = 'none';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processFile(file);
            }
        };

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    processFile(file) {
        this.loadMammoth().then(() => {
            if (!window.mammoth) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;

                window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        this.insertContent(result.value);
                        if (result.messages.length > 0) {
                            console.log('Import messages:', result.messages);
                        }
                    })
                    .catch(err => {
                        console.error('Import error:', err);
                        alert('Error parsing file.');
                    });
            };
            reader.readAsArrayBuffer(file);
        }).catch(() => {
            alert('Could not load the import library.');
        });
    }

    insertContent(html) {
        this.editor.focus();
        // Insert at cursor or append? ExecCommand 'insertHTML' inserts at cursor.
        document.execCommand('insertHTML', false, html);
    }
}
