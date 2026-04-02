import { useState, useCallback, useEffect } from "react";
import { getDirectoryContents, initiateFileDownload } from "./services/apiService";
import TopBar from "./components/TopBar/TopBar";
import FileGrid from "./components/FileGrid/FileGrid";
import FileModal from "./components/FileModal/FileModal";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

function App() {
  // ── State Management ──
  const [currentDirectoryPath, setCurrentDirectoryPath] = useState("/");
  const [directoryItems, setDirectoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // ── Lifecycle & Data Fetching ──
  useEffect(() => {
    let isMounted = true; 

    async function fetchDirectory() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDirectoryContents(currentDirectoryPath);
        if (!isMounted) return; 
        
        if (!data || !data.items) {
          throw new Error("Invalid format returned from server.");
        }
        setDirectoryItems(data.items);
      } catch (err) {
        if (!isMounted) return;
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load directory.");
        setDirectoryItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDirectory();

    return () => {
      isMounted = false; // Prevent memory leak updates on unmounted component
    };
  }, [currentDirectoryPath]);

  // ── Interaction Handlers ──
  const onNavigateToDirectory = useCallback((folderPath) => {
    setCurrentDirectoryPath(folderPath);
  }, []);

  const onDownloadRequested = useCallback((path) => {
    initiateFileDownload(path);
  }, []);

  const onFilePreview = useCallback((file) => {
    setPreviewFile(file);
  }, []);

  const closeFilePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const onToggleViewMode = useCallback((newMode) => {
    setViewMode(newMode);
  }, []);

  // ── Render Tree ──
  return (
    <ErrorBoundary>
      <div className="app-container">
        <TopBar
          currentDirectoryPath={currentDirectoryPath}
          onDirectoryNavigate={onNavigateToDirectory}
          viewMode={viewMode}
          onViewToggle={onToggleViewMode}
        />

        <main className="main-content">
          {error && (
            <div className="status-message error">
              ⚠️ {error}
            </div>
          )}

          {!error && (
            <FileGrid
              items={directoryItems}
              viewMode={viewMode}
              loading={loading}
              onDirectoryNavigate={onNavigateToDirectory}
              onFilePreview={onFilePreview}
              onFileDownload={onDownloadRequested}
            />
          )}
        </main>

        {previewFile && (
          <FileModal file={previewFile} onClose={closeFilePreview} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;