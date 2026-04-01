import React from "react";
import { getFileIcon, formatFileSize, formatDate } from "../../utils/helpers";

/**
 * Responsive internal grid and list item renderer.
 * Memoized heavily to prevent UI stuttering when arrays contain thousands of payloads.
 */
function FileItem({ item, onDirectoryNavigate, onFilePreview, onFileDownload, viewMode }) {
  const icon = getFileIcon(item.name, item.isFolder);
  const size = item.isFolder ? "" : formatFileSize(item.size);
  const date = formatDate(item.modified);

  function handleClick() {
    if (item.isFolder) {
      onDirectoryNavigate(item.path);
    } else {
      onFilePreview(item);
    }
  }

  function handleContextMenu(e) {
    e.preventDefault();
    if (window.confirm(`Download "${item.name}"?`)) {
      onFileDownload(item.path);
    }
  }

  function handleDownloadClick(e) {
    e.stopPropagation();
    onFileDownload(item.path);
  }

  // ── List View ─────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div
        className="file-item file-item--list"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={item.name}
      >
        <span className="file-icon">{icon}</span>
        <span className="file-name">{item.name}</span>
        <span className="file-size">{size}</span>
        <span className="file-date">{date}</span>
        <button className="download-btn" onClick={handleDownloadClick} title="Download">
          ⬇
        </button>
      </div>
    );
  }

  // ── Grid View ─────────────────────────────────────────────────────
  return (
    <div
      className="file-item file-item--grid"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={item.name}
    >
      <div className="file-icon-large">{icon}</div>
      <div className="file-name">{item.name}</div>
      <div className="file-meta">
        <span className="file-size">{size}</span>
      </div>
      <button className="download-btn" onClick={handleDownloadClick} title="Download">
        ⬇
      </button>
    </div>
  );
}

export default React.memo(FileItem);
