import { useState, useEffect, useCallback } from "react";
import { getDirectoryContents, initiateFileDownload } from "../services/apiService";

/**
 * Custom React Hook encapsulating the entirety of the directory 
 * fetching network layer, loading states, and error propagation.
 * 
 * @returns {Object} Directory state bindings and abstracted network handlers
 */
export function useDirectory() {
  const [currentDirectoryPath, setCurrentDirectoryPath] = useState("/");
  const [directoryItems, setDirectoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal UI state moved here to drastically simplify App.jsx layout
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevents memory leak updates on unmounted component

    async function getDirectoryNetworkCall() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDirectoryContents(currentDirectoryPath);
        if (!isMounted) return; // Stop if component unmounted while fetching

        if (!data || !data.items) {
          throw new Error("The server returned an invalid or unreadable format while mapping the directory.");
        }
        setDirectoryItems(data.items);
      } catch (err) {
        if (!isMounted) return; // Stop if component unmounted
        console.error("[useDirectory] getDirectoryNetworkCall error:", err);
        setError(err.message || "Failed to load directory.");
        setDirectoryItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    getDirectoryNetworkCall();

    return () => {
      isMounted = false; // Cleanup function fires on unmount
    };
  }, [currentDirectoryPath]);

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

  return {
    currentDirectoryPath,
    directoryItems,
    loading,
    error,
    onNavigateToDirectory,
    onDownloadRequested,
    previewFile,
    onFilePreview,
    closeFilePreview
  };
}
