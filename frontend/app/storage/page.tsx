"use client";
import React, { useState } from 'react';

const Storage = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Document 1' },
    { id: 2, name: 'Document 2' },
    { id: 3, name: 'Document 3' },
    {id:4, name:'Document 4'},
  ]);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  const handleCheckboxChange = (id: number) => {
    setSelectedDocs((prevSelectedDocs) =>
      prevSelectedDocs.includes(id)
        ? prevSelectedDocs.filter((docId) => docId !== id)
        : [...prevSelectedDocs, id]
    );
  };

  const handleDelete = () => {
    const updatedDocs = documents.filter((doc) => !selectedDocs.includes(doc.id));
    setDocuments(updatedDocs);
    setSelectedDocs([]);
  };

  const handleUpload = () => {
    // Logic to handle file upload
    alert('Upload functionality goes here!');
  };

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.header}>Your Stored Documents</h1>
      <div style={styles.docList}>
        {documents.length === 0 ? (
          <p style={styles.noDocs}>No documents uploaded yet.</p>
        ) : (
          <ul style={styles.ul}>
            {documents.map((doc) => (
              <li key={doc.id} style={styles.docItem}>
                <input
                  type="checkbox"
                  checked={selectedDocs.includes(doc.id)}
                  onChange={() => handleCheckboxChange(doc.id)}
                  style={styles.checkbox}
                />
                {doc.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={styles.buttonGroup}>
     
        {selectedDocs.length > 0 && (
          <button onClick={handleDelete} style={styles.deleteButton}>
            Delete Selected Documents
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#161B22',
    borderRadius: '8px',
    width: '90%',
    margin: '0 auto',
    color: '#C9D1D9',
    height:'100%',
  },
  header: {
    textAlign: 'center' as 'center', // Explicitly defining 'center' type for textAlign
    color: '#58A6FF',
    marginBottom: '20px',
  },
  docList: {
    marginBottom: '20px',
  },
  noDocs: {
    textAlign: 'center' as 'center', // Explicitly defining 'center' type for textAlign
    color: '#8B949E',
  },
  ul: {
    listStyleType: 'none',
    padding: '0',
  },
  docItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
    color: '#C9D1D9',
  },
  checkbox: {
    marginRight: '10px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  uploadButton: {
    backgroundColor: '#58A6FF',
    color: '#161B22',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    color: '#161B22',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Storage;
