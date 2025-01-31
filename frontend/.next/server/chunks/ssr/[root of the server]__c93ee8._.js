module.exports = {

"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/app/text-editor/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>TextEditor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function TextEditor() {
    const [uploadedFile, setUploadedFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [documentChunks, setDocumentChunks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userInput, setUserInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [suggestions, setSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const handleFileUpload = async (event)=>{
        if (!event.target.files?.length) return;
        const file = event.target.files[0];
        setUploadedFile(file);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch("http://127.0.0.1:5000/process-document", {
                method: "POST",
                body: formData
            });
            if (!response.ok) throw new Error("Failed to process the document.");
            const data = await response.json();
            setDocumentChunks(data.chunks || []);
        } catch (error) {
            alert("Error uploading the document. Please try again.");
        }
    };
    const handleGetSuggestions = async ()=>{
        try {
            const response = await fetch("http://127.0.0.1:5000/get-suggestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_input: userInput,
                    document_chunks: documentChunks
                })
            });
            if (!response.ok) throw new Error("Failed to fetch suggestions.");
            const data = await response.json();
            setSuggestions(data.map((item)=>item.bullet_point).join("\n"));
        } catch (error) {
            alert("Error fetching suggestions. Please try again.");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: "20px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "AI-Powered Text Editor"
            }, void 0, false, {
                fileName: "[project]/app/text-editor/page.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Step 1: Upload Your Document"
                    }, void 0, false, {
                        fileName: "[project]/app/text-editor/page.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        accept: ".txt,.pdf,.docx",
                        onChange: handleFileUpload
                    }, void 0, false, {
                        fileName: "[project]/app/text-editor/page.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/text-editor/page.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Step 2: Enter Your Query"
                    }, void 0, false, {
                        fileName: "[project]/app/text-editor/page.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        rows: 5,
                        cols: 50,
                        placeholder: "Enter your text here...",
                        value: userInput,
                        onChange: (e)=>setUserInput(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/app/text-editor/page.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleGetSuggestions,
                        children: "Get Suggestions"
                    }, void 0, false, {
                        fileName: "[project]/app/text-editor/page.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/text-editor/page.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Suggestions:"
                    }, void 0, false, {
                        fileName: "[project]/app/text-editor/page.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        children: suggestions
                    }, void 0, false, {
                        fileName: "[project]/app/text-editor/page.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/text-editor/page.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/text-editor/page.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
} // 'use client';
 // import { useState } from "react";
 // import dynamic from "next/dynamic";
 // import { saveAs } from "file-saver";
 // import { Document, Packer, Paragraph, TextRun } from "docx"; // For .docx formatting
 // import "quill/dist/quill.snow.css";
 // import styles from "./TextEditor.module.css";
 // const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
 // export default function TextEditor() {
 //   const [content, setContent] = useState(""); // Editor content
 //   const [documentTitle, setDocumentTitle] = useState("Untitled Document"); // File Name
 //   const [showFileDropdown, setShowFileDropdown] = useState(false);
 //   const [showEditDropdown, setShowEditDropdown] = useState(false);
 //   const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // Store file names
 //   // Quill Toolbar Options
 //   const modules = {
 //     toolbar: [
 //       [{ header: [1, 2, 3, false] }],
 //       ["bold", "italic", "underline", "strike"],
 //       [{ list: "ordered" }, { list: "bullet" }],
 //       [{ align: [] }],
 //       [{ indent: "-1" }, { indent: "+1" }],
 //       [{ color: [] }, { background: [] }],
 //       ["blockquote", "code-block"],
 //       ["clean"],
 //     ],
 //   };
 //   const handleSave = async () => {
 //     // Convert Quill HTML content to plain text
 //     const parser = new DOMParser();
 //     const doc = parser.parseFromString(content, "text/html");
 //     const plainText = doc.body.textContent || "";
 //     const wordDoc = new Document({
 //       sections: [
 //         {
 //           children: [
 //             new Paragraph({
 //               children: [new TextRun(plainText)], // No more HTML tags
 //             }),
 //           ],
 //         },
 //       ],
 //     });
 //     const blob = await Packer.toBlob(wordDoc);
 //     saveAs(blob, `${documentTitle || "Untitled Document"}.docx`);
 //   };
 //   // Open New Document (Clear Content)
 //   const handleOpenNew = () => {
 //     if (confirm("Open a new document? Unsaved changes will be lost.")) {
 //       setContent("");
 //     }
 //   };
 //   // Handle File Upload
 //   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 //     const files = e.target.files;
 //     if (files) {
 //       const fileNames = Array.from(files).map((file) => file.name);
 //       setUploadedFiles(fileNames.slice(0, 4)); // Keep first 4 file names
 //     }
 //   };
 //   // Handle Edit Actions
 //   const handleUndo = () => document.execCommand("undo");
 //   const handleRedo = () => document.execCommand("redo");
 //   const handleCopy = () => document.execCommand("copy");
 //   const handlePaste = () => document.execCommand("paste");
 //   return (
 //     <div className={styles["editor-container"]}>
 //       {/* Top Section: File Name + Toolbar */}
 //       <div className={styles["top-bar"]}>
 //         <input
 //           type="text"          
 //           value={documentTitle}
 //           onChange={(e) => setDocumentTitle(e.target.value)}
 //           className={styles["file-name-input"]}
 //         />
 //         {/* <div className="tool-option-container"> */}
 //         {/* File Dropdown */}
 //         <div className={styles["dropdown-container"]}>
 //           <button className={styles["dropdown-btn"]} onClick={() => setShowFileDropdown(!showFileDropdown)}>File</button>
 //           {showFileDropdown && (
 //             <div className={styles["dropdown-menu"]}>
 //               <button onClick={handleSave}>Save Document</button>
 //               <button onClick={handleOpenNew}>Open New Document</button>
 //             </div>
 //           )}
 //         </div>
 //         {/* Edit Dropdown */}
 //         <div className={styles["dropdown-container"]}>
 //           <button className={styles["dropdown-btn"]} onClick={() => setShowEditDropdown(!showEditDropdown)}>Edit</button>
 //           {showEditDropdown && (
 //             <div className={styles["dropdown-menu"]}>
 //               <button onClick={handleUndo}>Undo</button>
 //               <button onClick={handleRedo}>Redo</button>
 //               <button onClick={handleCopy}>Copy</button>
 //               <button onClick={handlePaste}>Paste</button>
 //             </div>
 //           )}
 //         {/* </div> */}
 //         </div>
 //       </div>
 //       {/* Main Layout: Suggestions on Left, Editor on Right */}
 //       <div className={styles["layout-container"]}>
 //         {/* Suggestions Panel */}
 //         <div className={styles["suggestions-panel"]}>
 //           <h3>Suggestions</h3>
 //           <div className={styles["file-names"]}>
 //             {uploadedFiles.map((fileName, index) => (
 //               <div key={index} className={styles["file-name-item"]}>
 //                 {fileName}
 //               </div>
 //             ))}
 //           </div>
 //           <input type="file" multiple onChange={handleFileUpload} />
 //         </div>
 //         {/* Text Editor Section */}
 //         <div className={styles["editor-area"]}>
 //           <ReactQuill value={content} onChange={setContent} theme="snow" modules={modules} />
 //         </div>
 //       </div>
 //     </div>
 //   );
 // }
}}),
"[project]/app/text-editor/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules ssr)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    } else {
        if ("TURBOPACK compile-time truthy", 1) {
            module.exports = __turbopack_require__("[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)");
        } else {
            "TURBOPACK unreachable";
        }
    }
} //# sourceMappingURL=module.compiled.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
module.exports = __turbopack_require__("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
"use strict";
module.exports = __turbopack_require__("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__c93ee8._.js.map