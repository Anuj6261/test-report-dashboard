import FileItem from "../FileItem/FileItem";
import "./FileGrid.css";

function FileGrid({ items, viewMode, onDirectoryNavigate, onFilePreview, onFileDownload }) {
  // Ensure items are normalized to prevent runtime map crashes
  const displayItems = Array.isArray(items) ? items : [];

  if (displayItems.length === 0) {
    return <p className="empty-message">This directory is empty.</p>;
  }

  return (
    <div className={`file-grid file-grid--${viewMode}`}>
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
