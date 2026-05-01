import React from 'react';

const DocumentViewer = ({ doc, onClose }) => {
  if (!doc) return null;

  const isImage = doc.file_url.split(/[?#]/)[0].match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isPDF = doc.file_url.split(/[?#]/)[0].match(/\.pdf$/i);

  return (
    <div className="doc-viewer-backdrop" onClick={onClose}>
      <div className="doc-viewer-container" onClick={e => e.stopPropagation()}>
        <div className="doc-viewer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{doc.document_type === 'prescription' ? '💊' : '📄'}</span>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a' }}>{doc.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{doc.document_type}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={doc.file_url} download className="btn-share-big" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#f1f5f9', color: '#0f172a', boxShadow: 'none' }}>Download</a>
            <button className="btn-close-viewer" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="doc-viewer-content">
          {isImage ? (
            <img 
              src={doc.file_url} 
              alt={doc.title} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Failed';
              }}
            />
          ) : isPDF ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem' }}>📄</div>
                <h3>PDF Document</h3>
                <p>For the best experience, open the PDF in a new tab.</p>
                <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn-share-big">Open Full Document</a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
              <h3>Preview Unavailable</h3>
              <p>This file type cannot be previewed. Please download it.</p>
              <a href={doc.file_url} className="btn-share-big" style={{ marginTop: '1.5rem' }}>Download File</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
