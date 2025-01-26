// 'use client';

// import { useState } from 'react';

// const TextEditor = () => {
//   const [content, setContent] = useState('');
//   const [isBold, setIsBold] = useState(false);
//   const [isItalic, setIsItalic] = useState(false);
//   const [alignment, setAlignment] = useState('left');

//   const handleBold = () => {
//     setIsBold(!isBold);
//   };

//   const handleItalic = () => {
//     setIsItalic(!isItalic);
//   };

//   const handleAlignLeft = () => {
//     setAlignment('left');
//   };

//   const handleAlignCenter = () => {
//     setAlignment('center');
//   };

//   const handleAlignRight = () => {
//     setAlignment('right');
//   };

//   // Handle file upload
//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0]; // Use optional chaining to handle null
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const fileContent = event.target?.result as string; // Type assertion
//       setContent(fileContent); // Set the file content as editor content
//     };
//     reader.readAsText(file);
//   }
// };


//   // Save the file content
//   const handleSaveFile = () => {
//     const blob = new Blob([content], { type: 'text/plain' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'document.txt';
//     link.click();
//   };

//   return (
//     <div style={styles.editorContainer}>
//       {/* Ribbon Toolbar */}
//       <div style={styles.ribbon}>
//         {/* Home Section */}
//         <div style={styles.section}>
//           <button style={styles.button} onClick={handleBold}>B</button>
//           <button style={styles.button} onClick={handleItalic}>I</button>
//           <button style={styles.button} onClick={handleAlignLeft}>Left</button>
//           <button style={styles.button} onClick={handleAlignCenter}>Center</button>
//           <button style={styles.button} onClick={handleAlignRight}>Right</button>
//         </div>

//         {/* Insert Section */}
//         <div style={styles.section}>
//           <button style={styles.button}>Insert Image</button>
//           <button style={styles.button}>Link</button>
//           <button style={styles.button}>Table</button>
//         </div>

//         {/* File Upload & Save Section */}
//         <div style={styles.section}>
//           <input
//             type="file"
//             accept=".txt"
//             style={{ display: 'none' }}
//             id="file-upload"
//             onChange={handleFileUpload}
//           />
//           <label htmlFor="file-upload" style={styles.button}>Upload File</label>
//           <button style={styles.button} onClick={handleSaveFile}>Save File</button>
//         </div>
//       </div>

//       {/* Text Area for input */}
//       <textarea
//   value={content}
//   onChange={(e) => setContent(e.target.value)}
//   style={{
//     ...styles.textArea,
//     fontWeight: isBold ? 'bold' : 'normal',
//     fontStyle: isItalic ? 'italic' : 'normal',
//     textAlign: alignment as React.CSSProperties['textAlign'], // Cast explicitly
//     resize: 'none', // Ensure resize uses a valid CSS value
//   }}
//   placeholder="Start typing here..."
// />


//     </div>
//   );
// };

// // Styles for the editor
// const styles = {
//   editorContainer: {
//     maxWidth: '1200px',
//     margin: '20px auto',
//     padding: '20px',
//     backgroundColor: '#0D1117',
//     color: '#C9D1D9',
//     borderRadius: '8px',
//     boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
//   },
//   ribbon: {
//     display: 'flex',
//     justifyContent: 'flex-start',
//     backgroundColor: '#161B22',
//     padding: '10px 20px',
//     marginBottom: '20px',
//     borderRadius: '5px',
//     gap: '20px',
//     alignItems: 'center',
//   },
//   section: {
//     display: 'flex',
//     gap: '15px',
//     alignItems: 'center',
//   },
//   button: {
//     backgroundColor: '#24292F',
//     color: '#C9D1D9',
//     border: 'none',
//     borderRadius: '5px',
//     padding: '8px 12px',
//     cursor: 'pointer',
//     fontSize: '14px',
//     transition: 'background-color 0.2s',
//   },
//   textArea: {
//     width: '100%',
//     minHeight: '500px',
//     padding: '15px',
//     backgroundColor: '#161B22',
//     color: '#C9D1D9',
//     border: '1px solid #30363D',
//     borderRadius: '5px',
//     fontSize: '16px',
//     lineHeight: '1.6',
//     // resize: 'none' as 'none', // Explicitly cast 'none' as a valid CSS value
//   },
//   };

// export default TextEditor;

"use client";

import { useState } from "react";

export default function TextEditor() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentChunks, setDocumentChunks] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const [suggestions, setSuggestions] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    setUploadedFile(file);
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/process-document", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to process the document.");
      const data = await response.json();
      setDocumentChunks(data.chunks || []);
    } catch (error) {
      alert("Error uploading the document. Please try again.");
    }
  };
  
  const handleGetSuggestions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: userInput, document_chunks: documentChunks }),
      });
      if (!response.ok) throw new Error("Failed to fetch suggestions.");
      const data = await response.json();
      setSuggestions(data.map((item: any) => item.bullet_point).join("\n"));
    } catch (error) {
      alert("Error fetching suggestions. Please try again.");
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI-Powered Text Editor</h1>

      <div>
        <h2>Step 1: Upload Your Document</h2>
        <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} />
      </div>

      <div>
        <h2>Step 2: Enter Your Query</h2>
        <textarea
          rows={5}
          cols={50}
          placeholder="Enter your text here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button onClick={handleGetSuggestions}>Get Suggestions</button>
      </div>

      <div>
        <h2>Suggestions:</h2>
        <pre>{suggestions}</pre>
      </div>
    </div>
  );
}

