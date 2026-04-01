import { useState, useEffect, useCallback } from "react";
import { fetchDirectoryContents, initiateFileDownload } from "../services/apiService";

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

  useEffect(() => {
    async function fetchDirectoryNetworkCall() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchDirectoryContents(currentDirectoryPath);
        if (!data || !data.items) {
          throw new Error("The server returned an invalid or unreadable format while mapping the directory.");
        }
        setDirectoryItems(data.items);
      } catch (err) {
        console.error("[useDirectory] fetchDirectoryNetworkCall error:", err);
        setError(err.message || "Failed to load directory.");
        setDirectoryItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDirectoryNetworkCall();
  }, [currentDirectoryPath]);

  const onNavigateToDirectory = useCallback((folderPath) => {
    setCurrentDirectoryPath(folderPath);
  }, []);

  const onDownloadRequested = useCallback((path) => {
    initiateFileDownload(path);
  }, []);

  return {
    currentDirectoryPath,
    directoryItems,
    loading,
    error,
    onNavigateToDirectory,
    onDownloadRequested,
  };
}
