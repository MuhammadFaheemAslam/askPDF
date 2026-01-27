import { useState, useEffect } from 'react';

const PDFToolbar = ({
  filename,
  currentPage,
  totalPages,
  scale,
  isDarkMode,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleTheme,
  onToggleFullscreen,
  onGoToPage,
  onBack,
}) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (page >= 1 && page <= totalPages) {
      onGoToPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput, 10);
    if (page >= 1 && page <= totalPages) {
      onGoToPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const zoomPercentage = Math.round(scale * 100);

  return (
    <div className="pdf-toolbar">
      <div className="toolbar-left">
        <button className="btn-icon" onClick={onBack} title="Go back to dashboard">
          <span className="icon-back"></span>
        </button>
        <span className="pdf-filename" title={filename}>
          {filename}
        </span>
      </div>

      <div className="toolbar-center">
        <div className="zoom-controls">
          <button
            className="btn-icon"
            onClick={onZoomOut}
            title="Zoom out (Ctrl+-)"
            disabled={scale <= 0.5}
          >
            <span className="icon-minus"></span>
          </button>
          <button
            className="zoom-level"
            onClick={onResetZoom}
            title="Reset zoom (Ctrl+0)"
          >
            {zoomPercentage}%
          </button>
          <button
            className="btn-icon"
            onClick={onZoomIn}
            title="Zoom in (Ctrl++)"
            disabled={scale >= 3}
          >
            <span className="icon-plus"></span>
          </button>
        </div>

        <div className="page-indicator">
          <form onSubmit={handlePageSubmit}>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              className="page-input"
              aria-label="Go to page"
            />
          </form>
          <span className="page-total">/ {totalPages}</span>
        </div>
      </div>

      <div className="toolbar-right">
        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className={isDarkMode ? 'icon-sun' : 'icon-moon'}></span>
        </button>
        <button
          className="btn-icon"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (Ctrl+F)'}
        >
          <span className={isFullscreen ? 'icon-minimize' : 'icon-maximize'}></span>
        </button>
      </div>
    </div>
  );
};

export default PDFToolbar;
