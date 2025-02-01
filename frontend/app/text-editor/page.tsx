'use client';
import { useState } from "react";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import Image from "next/image";
import "quill/dist/quill.snow.css";
import styles from "./TextEditor.module.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function TextEditor() {
  const [content, setContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: number; text: string }[]>([]);
  const [documentChunks, setDocumentChunks] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

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

  // Save document as .docx
  const handleSave = async () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const plainText = doc.body.textContent || "";

    const wordDoc = new Document({
      sections: [
        {
          children: [new Paragraph({ children: [new TextRun(plainText)] })],
        },
      ],
    });

    const blob = await Packer.toBlob(wordDoc);
    saveAs(blob, `${documentTitle || "Untitled Document"}.docx`);
  };

  // Open a new document
  const handleNewDocument = () => {
    setContent(""); // Clears the editor
    setDocumentTitle("Untitled Document");
  };

  // Copy text
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  // Paste text
  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setContent((prev) => prev + text);
  };

  // Undo & Redo
  const handleUndo = () => document.execCommand("undo");
  const handleRedo = () => document.execCommand("redo");

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setFile(files[0]); // Store the uploaded file

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await fetch("http://127.0.0.1:5000/process-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.chunks) {
        setDocumentChunks(data.chunks);
        setUploadedFiles((prevFiles) => [...prevFiles, files[0].name]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  // Fetch suggestions
  const handleGetSuggestions = async () => {
    if (!file) {
      alert("Please upload a document first.");
      return;
    }

    const response = await fetch("http://127.0.0.1:5000/get-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: content, document_chunks: documentChunks }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("Error fetching suggestions:", data.error);
    } else {
      setSuggestions(data);
    }
  };

  // Accept suggestion
  const handleAcceptSuggestion = (suggestionText: string) => {
    // Remove bullets and formatting from the suggestion
    const plainText = suggestionText
      .replace(/•/g, "") // Remove bullet points
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Remove extra spaces
      .trim();

    // Append the plain text suggestion to the existing content
    const newContent = content + " " + plainText;
    setContent(newContent);
  };

  return (
    <div className={styles["editor-container"]}>
      {/* Top Menu Bar */}
      <div className={styles["top-bar"]}>
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          className={styles["file-name-input"]}
        />

        {/* File Menu */}
        <div className={styles["menu"]}>
          <span>File</span>
          <div className={styles["dropdown"]}>
            <button onClick={handleSave}>
              <Image src="/folder-download.png" width={20} height={20} alt="Save" /> Save Document
            </button>
            <button onClick={handleNewDocument}>
              <Image src="/add-document.png" width={20} height={20} alt="New" /> Open New Document
            </button>
          </div>
        </div>

        {/* Edit Menu */}
        <div className={styles["menu"]}>
          <span>Edit</span>
          <div className={styles["dropdown"]}>
            <button onClick={handleUndo}>
              <Image src="/undo-alt.png" width={20} height={20} alt="Undo" /> Undo
            </button>
            <button onClick={handleRedo}>
              <Image src="/redo-alt.png" width={20} height={20} alt="Redo" /> Redo
            </button>
            <button onClick={handleCopy}>
              <Image src="/duplicate.png" width={20} height={20} alt="Copy" /> Copy
            </button>
            <button onClick={handlePaste}>
              <Image src="/paste.png" width={20} height={20} alt="Paste" /> Paste
            </button>
          </div>
        </div>
      </div>

      <div className={styles["layout-container"]}>
        {/* Suggestions Panel */}
        <div className={styles["suggestions-panel"]}>
          <h3>Suggestions</h3>
          <label htmlFor="file-upload" className={styles["file-upload-label"]} style={{ cursor: "pointer" }}>
            <Image src="/upload.png" width={25} height={25} alt="Upload File" className={styles["upload-icon"]} />
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.txt,.docx"
            style={{ display: "none" }}
          />
          {uploading && <p>Uploading...</p>}
          {uploadedFiles.map((fileName, index) => (
            <div key={index} className={styles["file-name-item"]}>
              {fileName}
            </div>
          ))}
          <button className={styles["suggestions-btn"]} onClick={handleGetSuggestions}>
            <Image src="/suggestion.png" width={40} height={40} alt="Suggestions" className={styles["suggestion-icon"]} />
          </button>
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <pre>{suggestion.text}</pre>
                <button onClick={() => handleAcceptSuggestion(suggestion.text)}>Accept</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Text Editor */}
        <div className={styles["editor-area"]}>
          <ReactQuill value={content} onChange={setContent} theme="snow" modules={modules} />
        </div>
      </div>
    </div>
  );
}