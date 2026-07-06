import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { sanitizeHtml } from "../lib/richText";

// A small WYSIWYG editor for the assessment Notes / Evidence fields.
// Emits HTML via onChange; the parent stores it verbatim (see App.updateResponse).
// `value` may be legacy plain text — sanitizeHtml upgrades it to HTML on load.
function ToolbarButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection/focus
      onClick={onClick}
      className={`rich-tb-btn${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder || "" }),
    ],
    content: sanitizeHtml(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap represents an empty doc as "<p></p>"; normalise to "" so empty
      // fields stay empty in state (matches the old textarea "" behaviour).
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external changes (e.g. JSON import replacing all responses) into the
  // editor, but never while the user is typing — that would reset the cursor.
  useEffect(() => {
    if (!editor) return;
    const incoming = sanitizeHtml(value);
    const current = editor.getHTML();
    const normalizedCurrent = current === "<p></p>" ? "" : current;
    if (incoming !== normalizedCurrent && incoming !== current && !editor.isFocused) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  return (
    <div className="rich-editor">
      <div className="rich-toolbar no-print">
        <ToolbarButton
          title="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="rich-editor-surface" />
    </div>
  );
}
