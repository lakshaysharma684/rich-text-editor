import RichTextEditor from './editor/RichTextEditor.js';

// Expose directly to window for non-npm usage
if (typeof window !== 'undefined') {
    window.RichTextEditor = RichTextEditor;
}

export default RichTextEditor;
