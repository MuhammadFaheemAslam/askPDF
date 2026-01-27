import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await api.get('/pdf/list');
      setPdfs(response.data);
    } catch (err) {
      setError('Failed to fetch PDFs');
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress({ current: 0, total: files.length });

    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length });

      const formData = new FormData();
      formData.append('file', file);

      try {
        await api.post('/pdf/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (err) {
        errors.push(`${file.name}: ${err.response?.data?.detail || 'Upload failed'}`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    fetchPdfs();
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleUpload(files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter((file) => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      setError('Please drop valid PDF files');
    } else if (pdfFiles.length < droppedFiles.length) {
      setError('Some files were skipped (only PDF files allowed)');
      handleUpload(pdfFiles);
    } else {
      handleUpload(pdfFiles);
    }
  };

  const handleDelete = async (pdfId) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;

    try {
      await api.delete(`/pdf/${pdfId}`);
      setPdfs(pdfs.filter((pdf) => pdf.id !== pdfId));
    } catch (err) {
      setError('Failed to delete PDF');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Documents</h1>
        <p>Welcome back, {user?.username}! Manage your PDF files below.</p>
      </div>

      <div className="upload-section">
        <div
          className={`upload-area ${dragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p className="upload-text">
                Uploading {uploadProgress.current} of {uploadProgress.total} file{uploadProgress.total > 1 ? 's' : ''}...
              </p>
            </>
          ) : (
            <>
              <div className="upload-icon">📤</div>
              <p className="upload-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="upload-hint">PDF files only (max 10MB each) - Multiple files supported</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            hidden
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="pdf-list">
        {pdfs.length === 0 ? (
          <div className="no-pdfs">
            <div className="no-pdfs-icon">📁</div>
            <h3>No documents yet</h3>
            <p>Upload your first PDF to get started!</p>
          </div>
        ) : (
          pdfs.map((pdf) => (
            <div key={pdf.id} className="pdf-card">
              <div className="pdf-info">
                <div className="pdf-icon">📄</div>
                <div className="pdf-details">
                  <span className="pdf-name">{pdf.filename}</span>
                  <span className="pdf-meta">
                    Uploaded {formatDate(pdf.uploaded_at)}
                  </span>
                </div>
              </div>
              <div className="pdf-actions">
                <Link to={`/pdf/${pdf.id}`} className="btn btn-primary btn-sm">
                  View
                </Link>
                <button
                  onClick={() => handleDelete(pdf.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
