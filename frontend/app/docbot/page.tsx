'use client';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import './Docbot.css';  // Import modular CSS

const DocBot = () => {
  const [chat, setChat] = useState('');
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    if (!chat.trim()) return;
    setMessages([...messages, { user: chat, bot: 'Thinking...' }]);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: chat }),
      });
      const data = await response.json();

    setMessages((prev) =>
      prev.slice(0, -1).concat({ user: chat, bot: data.answer || "Error getting response" })
    );
  } catch (error) {
    console.error("Error fetching response:", error);
    setMessages((prev) =>
      prev.slice(0, -1).concat({ user: chat, bot: "Failed to get response from AI." })
    );
  }
    setChat('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsProcessing(true);
      const uploadedFiles = Array.from(files).map(file => file.name);
      setFileNames(prev => [...prev, ...uploadedFiles]);
      setMessages([...messages, { user: 'Uploaded Files', bot: 'Processing files...' }]);
      
      setTimeout(() => {
        setMessages(prev => prev.slice(0, -1).concat({ user: 'Uploaded Files', bot: 'Files processed successfully!' }));
        setIsProcessing(false);
      }, 3000);
    }
  };

  const downloadChat = () => {
    const chatContent = messages.map(msg => `User: ${msg.user}\nBot: ${msg.bot}\n`).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat_history.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="docbot-container">
      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="sidebar-content">
          <button
            onClick={() => setSidebarOpen(false)}
            className="close-btn"
          >
            <FiX />
          </button>
          <h2 className="sidebar-heading">Upload Files</h2>
          <input
            type="file"
            accept=".pdf"
            multiple
            id="file-upload"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
          <label htmlFor="file-upload" className="upload-label">
            📎 Upload Files
          </label>
          <div className="file-list">
            {fileNames.length > 0 && fileNames.map((fileName, index) => (
              <p key={index} className="file-item">{fileName}</p>
            ))}
          </div>
          {isProcessing && <p className="processing-text">Processing files...</p>}
          <button
            onClick={downloadChat}
            className="download-btn"
          >
            ⬇️ Download Chat
          </button>
        </div>
      </div>

      {/* Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="hamburger-btn"
      >
        <FiMenu size={24} />
      </button>

      {/* Main Chat Section */}
      <div className="chat-container">
        <h1 className="chat-heading">📚 Chat with Your PDF</h1>
        <div className="chat-box">
          {messages.length === 0 ? (
            <p className="empty-chat">No chat history. Ask a question!</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.user === 'Uploaded Files' ? 'centered' : ''}`}
              >
                <div className={`message-bubble ${msg.user === 'Uploaded Files' ? 'file-message' : ''}`}>
                  <p className="message-text"><strong>{msg.user}:</strong> {msg.bot}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Query Input (Centered) */}
        <div className="query-input">
          <input
            type="text"
            placeholder="Ask about your document..."
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            className="input-box"
          />
          <button
            onClick={handleSend}
            className="send-btn"
          >
            → Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocBot;
