import { useState, useCallback } from "react";
import { useDirectory } from "./hooks/useDirectory";
import TopBar from "./components/TopBar/TopBar";
import FileGrid from "./components/FileGrid/FileGrid";
import FileModal from "./components/FileModal/FileModal";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

function App() {
  const {
    currentDirectoryPath,
    directoryItems,
    loading,
    error,
    onNavigateToDirectory,
    onDownloadRequested,
    previewFile,
    onFilePreview,
    closeFilePreview
  } = useDirectory();

  const [viewMode, setViewMode] = useState("grid");

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
          {error && (
            <div className="status-message error">
              ⚠️ {error}
            </div>
          )}

          {!error && (
            <FileGrid
              items={directoryItems}
              viewMode={viewMode}
              loading={loading} /* Delegating skeleton state logic strictly directly to Grid Layer */
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