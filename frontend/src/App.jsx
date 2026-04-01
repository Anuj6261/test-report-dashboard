import { useState, useCallback } from "react";
import { useDirectory } from "./hooks/useDirectory";
import TopBar from "./components/TopBar/TopBar";
import FileGrid from "./components/FileGrid/FileGrid";
import FileModal from "./components/FileModal/FileModal";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

/**
 * Pure Presentation Shell Component
 * Logic is abstracted to the custom `useDirectory` hook.
 */
function App() {
  // Extract state properties and callback methods from custom architectural hook
  const {
    currentDirectoryPath,
    directoryItems,
    loading,
    error,
    onNavigateToDirectory,
    onDownloadRequested,
  } = useDirectory();

  // Pure UI viewing states remain directly in the presentation component
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const onPreviewFile = useCallback((file) => {
    setPreviewFile(file);
  }, []);

  const closeFilePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const onToggleViewMode = useCallback((newMode) => {
    setViewMode(newMode);
  }, []);

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
          {loading && (
            <div className="status-message loading">
              ⏳ Loading directory contents...
            </div>
          )}

          {error && (
            <div className="status-message error">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && directoryItems.length === 0 && (
            <div className="status-message empty">
              📂 This directory is empty.
            </div>
          )}

          {!loading && !error && directoryItems.length > 0 && (
            <FileGrid
              items={directoryItems}
              viewMode={viewMode}
              onDirectoryNavigate={onNavigateToDirectory}
              onFilePreview={onPreviewFile}
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