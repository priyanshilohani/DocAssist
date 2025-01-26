'use client';
import { useState } from 'react';

const DocBot = () => {
  const [chat, setChat] = useState<string>('');
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleSend = () => {
    setMessages([...messages, { user: chat, bot: "Here's a suggestion!" }]);
    setChat('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name); // Store the file name
      setMessages([...messages, { user: 'Uploaded File', bot: "Processing file..." }]);
    }
  };

  return (
    <div className="container">
      <h1>DocBot</h1>

      {/* Chat Box */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user === 'Uploaded File' ? 'file-message' : ''}`}>
            <p className={`user-message`}>{msg.user}:</p>
            <p className="bot-message"><strong>Bot:</strong> {msg.bot}</p>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="input-area">
        {/* File Upload Button */}
        <input
          type="file"
          accept=".txt,.pdf,.docx"
          style={{ display: 'none' }}
          id="file-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload" className="file-upload-btn">📎</label>

        {/* Text input */}
        <input
          type="text"
          placeholder="Ask DocBot..."
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          className="chat-input"
        />

        {/* Send Button */}
        <button onClick={handleSend} className="send-btn">→</button>
      </div>

      {/* File Name Display */}
      {fileName && (
        <div className="file-name-preview">
          <h2>Uploaded File: {fileName}</h2>
        </div>
      )}
    </div>
  );
};

export default DocBot;
