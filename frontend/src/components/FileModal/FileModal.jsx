import { useState, useEffect } from "react";
import { getFileContent } from "../../services/apiService";
import { formatFileSize } from "../../utils/helpers";
import { FileText } from "lucide-react";
import "./FileModal.css";

const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB limit

function FileModal({ file, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFile() {
      setLoading(true);
      setError(null);
      setContent(null);

      try {
        if (!file || !file.path) {
          throw new Error("Cannot open file: The file path is missing.");
        }

        const text = await getFileContent(file.path);
        if (!isMounted) return;

        if (!text || typeof text !== "string") {
          throw new Error("The file appears to be empty or contains unsupported data.");
        }

        if (text.length > MAX_CONTENT_SIZE) {
          throw new Error(
            `Cannot preview file: Content is too large (${(text.length / 1024 / 1024).toFixed(1)} MB). Maximum allowed is 5MB.`
          );
        }

        setContent(text);
      } catch (err) {
        if (!isMounted) return;
        console.error("[FileModal] Error loading file:", err);
        setError(err.message || "An unexpected error occurred while loading the file.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFile();

    return () => {
      isMounted = false;
    };
  }, [file?.path]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const sizeDisplay = formatFileSize(file.size);
  const dateDisplay = file.modified ? new Date(file.modified).toLocaleString() : "—";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <span className="modal-filename" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} />
            {file.name}
          </span>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {loading && <p className="status-message loading">⏳ Loading file content...</p>}
          {error && <p className="status-message error">⚠️ {error}</p>}
          {!loading && !error && content && <pre className="file-content">{content}</pre>}
          {!loading && !error && !content && <p className="status-message empty">📄 File is empty</p>}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <span>📏 Size: {sizeDisplay}</span>
          <span>📅 Modified: {dateDisplay}</span>
        </div>
      </div>
    </div>
  );
}

export default FileModal;
