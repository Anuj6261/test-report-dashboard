import React, { useCallback } from "react";
import { formatFileSize, formatDate } from "../../utils/helpers";
import { 
  Folder, FileText, Image, Film, Music, Archive, Code, Database, File, Download
} from "lucide-react";

// Determine which scalable Lucide Component to mount based securely on file extensions
function getIconForFile(name, isFolder) {
  if (isFolder) return Folder;
  const ext = name.split(".").pop().toLowerCase();
  
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return Image;
  if (["mp4", "mov", "avi", "mkv"].includes(ext)) return Film;
  if (["mp3", "wav", "flac"].includes(ext)) return Music;
  if (["zip", "tar", "gz", "rar"].includes(ext)) return Archive;
  if (["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "html", "css"].includes(ext)) return Code;
  if (["json", "xml", "yaml", "yml", "csv"].includes(ext)) return Database;
  if (["log", "txt", "md", "pdf"].includes(ext)) return FileText;
  
  return File;
}

/**
 * Responsive internal grid and list item renderer.
 * Memoized heavily to prevent UI stuttering when arrays contain thousands of payloads.
 */
function FileItem({ item, onDirectoryNavigate, onFilePreview, onFileDownload, viewMode }) {
  const IconComponent = getIconForFile(item.name, item.isFolder);
  const size = item.isFolder ? "" : formatFileSize(item.size);
  const date = formatDate(item.modified);

  // Memoized handlers prevent inline object references from breaking 'React.memo' caching bounds
  const handleClick = useCallback(() => {
    if (item.isFolder) {
      onDirectoryNavigate(item.path);
    } else {
      onFilePreview(item);
    }
  }, [item, onDirectoryNavigate, onFilePreview]);

  const handleDownloadClick = useCallback((e) => {
    e.stopPropagation();
    onFileDownload(item.path);
  }, [item.path, onFileDownload]);

  // Removed blocking 'onContextMenu' windows; OS context menus natively restore.
  // ── List View ─────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div className="file-item file-item--list" onClick={handleClick} title={item.name}>
        <span className="file-icon" style={{ display: 'flex', alignItems: 'center' }}>
          <IconComponent size={20} strokeWidth={1.5} color={item.isFolder ? "#f6ad55" : "#a0aec0"} />
        </span>
        <span className="file-name">{item.name}</span>
        <span className="file-size">{size}</span>
        <span className="file-date">{date}</span>
        <button className="download-btn" onClick={handleDownloadClick} title="Download">
          <Download size={16} strokeWidth={2} />
        </button>
      </div>
    );
  }

  // ── Grid View ─────────────────────────────────────────────────────
  return (
    <div className="file-item file-item--grid" onClick={handleClick} title={item.name}>
      <div className="file-icon-large" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <IconComponent size={48} strokeWidth={1.25} color={item.isFolder ? "#f6ad55" : "#a0aec0"} />
      </div>
      <div className="file-name">{item.name}</div>
      <div className="file-meta">
        <span className="file-size">{size}</span>
      </div>
      <button className="download-btn" onClick={handleDownloadClick} title="Download">
        <Download size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

// Deep structural comparator: massively increases performance by discarding unchanged memory references
export default React.memo(FileItem, (prevProps, nextProps) => {
  return (
    prevProps.item.path === nextProps.item.path &&
    prevProps.item.modified === nextProps.item.modified &&
    prevProps.viewMode === nextProps.viewMode
  );
});
