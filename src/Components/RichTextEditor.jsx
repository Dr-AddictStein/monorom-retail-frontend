import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "link",
];

const RichTextEditor = ({ value = "", onChange, placeholder = "Write product description..." }) => {
  const editorModules = useMemo(() => modules, []);

  return (
    <div className="rich-text-editor rounded-lg border border-base-300 bg-base-100 overflow-hidden">
      <ReactQuill
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
        }
        .rich-text-editor .ql-container.ql-snow {
          border: none;
          font-size: 1rem;
          min-height: 180px;
        }
        .rich-text-editor .ql-editor {
          min-height: 180px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: hsl(var(--bc) / 0.4);
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
        .rich-text-content h1 { font-size: 1.75rem; font-weight: 700; margin: 0.75em 0 0.4em; }
        .rich-text-content h2 { font-size: 1.4rem; font-weight: 700; margin: 0.75em 0 0.4em; }
        .rich-text-content h3 { font-size: 1.15rem; font-weight: 600; margin: 0.75em 0 0.35em; }
        .rich-text-content p { margin: 0.5em 0; }
        .rich-text-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.5em 0; }
        .rich-text-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5em 0; }
        .rich-text-content a { color: #2563eb; text-decoration: underline; }
        .rich-text-content strong { font-weight: 700; }
        .rich-text-content em { font-style: italic; }
      `}</style>
    </>
  );
};

export default RichTextEditor;
