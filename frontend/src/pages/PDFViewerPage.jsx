import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { PDFViewer } from '../components/PDFViewer';
import api from '../api/axios';

const PDFViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPdfInfo = async () => {
      try {
        const response = await api.get(`/pdf/${id}`);
        setPdfData(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('PDF not found');
        } else if (err.response?.status === 401) {
          setError('Please log in to view this PDF');
          navigate('/login');
        } else {
          setError('Failed to load PDF');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPdfInfo();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading PDF...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h2>{error}</h2>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Construct authenticated PDF URL with token
  const token = localStorage.getItem('token');
  const pdfUrl = `${api.defaults.baseURL}/pdf/${id}/view?token=${encodeURIComponent(token)}`;

  return (
    <ThemeProvider>
      <PDFViewer pdfUrl={pdfUrl} filename={pdfData.filename} />
    </ThemeProvider>
  );
};

export default PDFViewerPage;
