const PDFPageNavigator = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className="pdf-page-navigator">
      <button
        className="nav-btn nav-prev"
        onClick={onPrevPage}
        disabled={!canGoPrev}
        title="Previous page (Left Arrow)"
        aria-label="Previous page"
      >
        <span className="nav-icon"></span>
      </button>

      <div className="page-progress">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentPage}
          aria-valuemin={1}
          aria-valuemax={totalPages}
        />
      </div>

      <button
        className="nav-btn nav-next"
        onClick={onNextPage}
        disabled={!canGoNext}
        title="Next page (Right Arrow)"
        aria-label="Next page"
      >
        <span className="nav-icon"></span>
      </button>
    </div>
  );
};

export default PDFPageNavigator;
