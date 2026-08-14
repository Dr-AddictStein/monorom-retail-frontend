import { useEffect, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { uploadFile } from "../utils/uploadFile";

const toolbarContainer = [
  [{ header: [1, 2, 3, 4, false] }],
  [{ font: [] }],
  [{ size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link", "image", "video"],
  ["clean"],
];

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "bullet",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
];

const insertUploadedImage = async (quill, file) => {
  if (!quill || !file) return;
  const range = quill.getSelection(true) || { index: quill.getLength() };
  const placeholder = "Uploading image…";
  quill.insertText(range.index, placeholder, { italic: true }, "user");
  quill.setSelection(range.index + placeholder.length);

  try {
    const url = await uploadFile(file);
    quill.deleteText(range.index, placeholder.length, "user");
    quill.insertEmbed(range.index, "image", url, "user");
    quill.setSelection(range.index + 1, 0, "user");
  } catch (error) {
    quill.deleteText(range.index, placeholder.length, "user");
    window.alert("Image upload failed. Please try again.");
    console.error("Rich text image upload failed:", error);
  }
};

const imageHandler = function imageHandler() {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    await insertUploadedImage(this.quill, file);
  };
};

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Write here...",
  minHeight = 220,
}) => {
  const quillRef = useRef(null);

  const editorModules = useMemo(
    () => ({
      toolbar: {
        container: toolbarContainer,
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
      history: {
        delay: 500,
        maxStack: 200,
        userOnly: true,
      },
    }),
    []
  );

  useEffect(() => {
    let root;
    let cancelled = false;
    let handlePaste;
    let handleDrop;

    const tryAttach = () => {
      if (cancelled) return;
      const editor = quillRef.current?.getEditor?.();
      if (!editor) {
        requestAnimationFrame(tryAttach);
        return;
      }

      root = editor.root;
      handlePaste = (event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (!imageItem) return;
        event.preventDefault();
        insertUploadedImage(editor, imageItem.getAsFile());
      };
      handleDrop = (event) => {
        const file = Array.from(event.dataTransfer?.files || []).find((item) =>
          item.type.startsWith("image/")
        );
        if (!file) return;
        event.preventDefault();
        insertUploadedImage(editor, file);
      };

      root.addEventListener("paste", handlePaste);
      root.addEventListener("drop", handleDrop);
    };

    tryAttach();

    return () => {
      cancelled = true;
      if (root && handlePaste && handleDrop) {
        root.removeEventListener("paste", handlePaste);
        root.removeEventListener("drop", handleDrop);
      }
    };
  }, []);

  return (
    <div className="rich-text-editor rounded-lg border border-base-300 bg-base-100 overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={editorModules}
        formats={formats}
        placeholder={placeholder}
      />
      <style>{`
        .rich-text-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid hsl(var(--bc) / 0.15);
          background: hsl(var(--b2));
          flex-wrap: wrap;
        }
        .rich-text-editor .ql-container.ql-snow {
          border: none;
          font-size: 1rem;
          min-height: ${minHeight}px;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight}px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: hsl(var(--bc) / 0.4);
        }
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .rich-text-editor .ql-snow .ql-picker.ql-expanded {
          z-index: 20;
        }
      `}</style>
    </div>
  );
};

/** Renders stored HTML description safely for display pages */
export const RichTextContent = ({ html, className = "", emptyText = "No description available." }) => {
  const hasContent = html && html.replace(/<[^>]*>/g, "").trim().length > 0;

  if (!hasContent) {
    return <p className={className}>{emptyText}</p>;
  }

  return (
    <>
      <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .rich-text-content h1 { font-size: 1.75rem; font-weight: 700; margin: 0.75em 0 0.4em; line-height: 1.25; }
        .rich-text-content h2 { font-size: 1.4rem; font-weight: 700; margin: 0.75em 0 0.4em; line-height: 1.3; }
        .rich-text-content h3 { font-size: 1.15rem; font-weight: 600; margin: 0.75em 0 0.35em; }
        .rich-text-content h4 { font-size: 1.05rem; font-weight: 600; margin: 0.7em 0 0.3em; }
        .rich-text-content p { margin: 0.5em 0; line-height: 1.7; }
        .rich-text-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.5em 0; }
        .rich-text-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5em 0; }
        .rich-text-content li { margin: 0.25em 0; }
        .rich-text-content a { color: #2563eb; text-decoration: underline; }
        .rich-text-content strong { font-weight: 700; }
        .rich-text-content em { font-style: italic; }
        .rich-text-content u { text-decoration: underline; }
        .rich-text-content s { text-decoration: line-through; }
        .rich-text-content blockquote {
          border-left: 4px solid #212121;
          padding: 0.35rem 0 0.35rem 1rem;
          margin: 1em 0;
          color: #374151;
        }
        .rich-text-content pre,
        .rich-text-content .ql-syntax {
          background: #111827;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1em 0;
        }
        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1em 0;
          display: block;
        }
        .rich-text-content iframe,
        .rich-text-content video,
        .rich-text-content .ql-video {
          max-width: 100%;
          width: 100%;
          min-height: 280px;
          margin: 1em 0;
          border: 0;
        }
      `}</style>
    </>
  );
};

export default RichTextEditor;
