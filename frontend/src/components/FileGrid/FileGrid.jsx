import FileItem from "../FileItem/FileItem";
import "./FileGrid.css";

function FileGrid({ items, viewMode, loading, onDirectoryNavigate, onFilePreview, onFileDownload }) {
  const displayItems = Array.isArray(items) ? items : [];

  // ── SKELETON LOADER STATE ──
  // If actively fetching data, render beautiful phantom skeleton lists instead of raw text.
  if (loading) {
    const skeletonArray = Array.from({ length: 12 });
    return (
      <div className={`file-grid file-grid--${viewMode}`}>
        {viewMode === "list" && (
          <div className="list-header">
            <span className="header-name">Name</span>
            <span className="header-size">Size</span>
            <span className="header-date">Modified</span>
            <span className="header-action"></span>
          </div>
        )}
        {skeletonArray.map((_, i) => (
          <div key={i} className={`skeleton-container skeleton-container--${viewMode}`}>
            {viewMode === "grid" ? (
              <>
                <div className="skeleton-icon skeleton"></div>
                <div className="skeleton-text skeleton"></div>
                <div className="skeleton-subtext skeleton"></div>
              </>
            ) : (
              <>
                <div className="skeleton-icon-list skeleton"></div>
                <div className="skeleton-text-list skeleton"></div>
                <div className="skeleton-subtext-list skeleton"></div>
                <div className="skeleton-subtext-list skeleton"></div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── EMPTY STATE ──
  if (displayItems.length === 0) {
    return (
      <div className="empty-state-wrapper">
        <p className="empty-message">📂 This directory is currently empty.</p>
      </div>
    );
  }

  // ── RENDER DATA ──
  return (
    <div className={`file-grid file-grid--${viewMode}`}>
      {viewMode === "list" && (
        <div className="list-header">
          <span className="header-name">Component Target</span>
          <span className="header-size">Payload Size</span>
          <span className="header-date">Date Modified</span>
          <span className="header-action">Action</span>
        </div>
      )}
      {displayItems.map((item) => (
        <FileItem
          key={item.path}
          item={item}
          viewMode={viewMode}
          onDirectoryNavigate={onDirectoryNavigate}
          onFilePreview={onFilePreview}
          onFileDownload={onFileDownload}
        />
      ))}
    </div>
  );
}

export default FileGrid;
