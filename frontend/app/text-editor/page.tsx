'use client';
import { useState } from "react";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx"; // For .docx formatting
import "quill/dist/quill.snow.css";
import styles from "./TextEditor.module.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function TextEditor() {
  const [content, setContent] = useState(""); // Editor content
  const [documentTitle, setDocumentTitle] = useState("Untitled Document"); // File Name
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // Store file names

  // Quill Toolbar Options
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  };

  const handleSave = async () => {
    // Convert Quill HTML content to plain text
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const plainText = doc.body.textContent || "";
  
    const wordDoc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun(plainText)], // No more HTML tags
            }),
          ],
        },
      ],
    });
  
    const blob = await Packer.toBlob(wordDoc);
    saveAs(blob, `${documentTitle || "Untitled Document"}.docx`);
  };
  

  // Open New Document (Clear Content)
  const handleOpenNew = () => {
    if (confirm("Open a new document? Unsaved changes will be lost.")) {
      setContent("");
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedFiles(fileNames.slice(0, 4)); // Keep first 4 file names
    }
  };

  // Handle Edit Actions
  const handleUndo = () => document.execCommand("undo");
  const handleRedo = () => document.execCommand("redo");
  const handleCopy = () => document.execCommand("copy");
  const handlePaste = () => document.execCommand("paste");

  return (
    <div className={styles["editor-container"]}>
      {/* Top Section: File Name + Toolbar */}
      <div className={styles["top-bar"]}>
        <input
          type="text"          
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          className={styles["file-name-input"]}
        />
        {/* <div className="tool-option-container"> */}
        {/* File Dropdown */}
        <div className={styles["dropdown-container"]}>
          <button className={styles["dropdown-btn"]} onClick={() => setShowFileDropdown(!showFileDropdown)}>File</button>
          {showFileDropdown && (
            <div className={styles["dropdown-menu"]}>
              <button onClick={handleSave}>Save Document</button>
              <button onClick={handleOpenNew}>Open New Document</button>
            </div>
          )}
        </div>

        {/* Edit Dropdown */}
        <div className={styles["dropdown-container"]}>
          <button className={styles["dropdown-btn"]} onClick={() => setShowEditDropdown(!showEditDropdown)}>Edit</button>
          {showEditDropdown && (
            <div className={styles["dropdown-menu"]}>
              <button onClick={handleUndo}>Undo</button>
              <button onClick={handleRedo}>Redo</button>
              <button onClick={handleCopy}>Copy</button>
              <button onClick={handlePaste}>Paste</button>
            </div>
          )}
        {/* </div> */}
        </div>
      </div>

      {/* Main Layout: Suggestions on Left, Editor on Right */}
      <div className={styles["layout-container"]}>
        {/* Suggestions Panel */}
        <div className={styles["suggestions-panel"]}>
          <h3>Suggestions</h3>
          <div className={styles["file-names"]}>
            {uploadedFiles.map((fileName, index) => (
              <div key={index} className={styles["file-name-item"]}>
                {fileName}
              </div>
            ))}
          </div>
          <input type="file" multiple onChange={handleFileUpload} />
        </div>

        {/* Text Editor Section */}
        <div className={styles["editor-area"]}>
          <ReactQuill value={content} onChange={setContent} theme="snow" modules={modules} />
        </div>
      </div>
    </div>
  );
}
