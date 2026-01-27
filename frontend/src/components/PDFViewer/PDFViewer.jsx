import { useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
import { usePDFViewer } from '../../hooks/usePDFViewer';
import { useTheme } from '../../context/ThemeContext';
import PDFToolbar from './PDFToolbar';
import PDFPageNavigator from './PDFPageNavigator';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PDFViewer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ pdfUrl, filename }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const {
    currentPage,
    totalPages,
    scale,
    isFullscreen,
    isLoading,
    error,
    setTotalPages,
    setIsLoading,
    setError,
    zoomIn,
    zoomOut,
    resetZoom,
    goToPage,
    nextPage,
    prevPage,
    toggleFullscreen,
  } = usePDFViewer();

  const { isDarkMode, toggleTheme } = useTheme();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setTotalPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err) => {
    console.error('PDF load error:', err);
    setError('Failed to load PDF. Please try again.');
    setIsLoading(false);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div
      className={`pdf-viewer-container ${isDarkMode ? 'dark-mode' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      <PDFToolbar
        filename={filename}
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        isDarkMode={isDarkMode}
        isFullscreen={isFullscreen}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onToggleTheme={toggleTheme}
        onToggleFullscreen={toggleFullscreen}
        onGoToPage={goToPage}
        onBack={handleBack}
      />

      <div className="pdf-document-wrapper">
        {isLoading && (
          <div className="pdf-loading">
            <div className="loading-spinner"></div>
            <span>Loading PDF...</span>
          </div>
        )}

        {error && (
          <div className="pdf-error">
            <div className="error-icon">!</div>
            <span>{error}</span>
            <button className="btn btn-primary" onClick={handleBack}>
              Back to Dashboard
            </button>
          </div>
        )}

        {!error && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="pdf-document"
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              className="pdf-page"
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="page-loading">
                  <div className="loading-spinner small"></div>
                </div>
              }
            />
          </Document>
        )}
      </div>

      {!error && totalPages > 0 && (
        <PDFPageNavigator
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={prevPage}
          onNextPage={nextPage}
        />
      )}
    </div>
  );
};

export default PDFViewer;
