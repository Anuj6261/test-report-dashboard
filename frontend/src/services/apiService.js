
// ── Configuration ────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TIMEOUT_MS = parseInt(import.meta.env.VITE_API_TIMEOUT_MS || "30000", 10);
const MAX_RETRIES = parseInt(import.meta.env.VITE_API_MAX_RETRIES || "3", 10);
const RETRY_DELAY_MS = parseInt(import.meta.env.VITE_API_RETRY_DELAY_MS || "1000", 10);

// ── Helper: Fetch with timeout ───────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(
        `Connection timed out after ${timeout}ms. The server may be unresponsive.`
      );
    }
    throw err;
  }
}

// ── Helper: Retry logic for transient failures ───────────────────────
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Success — return immediately
      if (response.ok) return response;

      // 4xx errors are client-side issues — don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(
          `Request failed (${response.status}): ${response.statusText}`
        );
      }

      // 5xx errors may be transient — retry
      if (response.status >= 500) {
        lastError = new Error(
          `Server encountered an issue (${response.status}): ${response.statusText}`
        );
        if (i < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY_MS * (i + 1))
          );
          continue;
        }
      }

      return response;
    } catch (err) {
      lastError = err;

      // Don't retry on abort (user-initiated cancellation)
      if (
        err.name === "AbortError" ||
        err.message.includes("timeout")
      ) {
        throw err;
      }

      // Wait before retry
      if (i < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * (i + 1))
        );
      }
    }
  }

  throw lastError || new Error("Unable to complete request after multiple attempts. Please check your connection.");
}

// ── API: List folder contents ─────────────────────────────────────────
export async function fetchDirectoryContents(path) {
  try {
    const url = `${BASE_URL}/api/list?path=${encodeURIComponent(path)}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Failed to open folder: ${detail || response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("The server returned an invalid or malformed response.");
    }

    return data;
  } catch (err) {
    console.error("[fetchDirectoryContents] Error:", err);
    throw err;
  }
}

// ── API: Read file contents ───────────────────────────────────────────
export async function fetchFileContent(path) {
  try {
    const url = `${BASE_URL}/api/file?path=${encodeURIComponent(path)}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(
        `Unable to view file (${response.status}): ${response.statusText}`
      );
    }

    const text = await response.text();
    if (!text) {
      console.warn("[fetchFileContent] Warning: file is empty");
    }

    return text;
  } catch (err) {
    console.error("[fetchFileContent] Error:", err);
    throw err;
  }
}

// ── Helper: Get download URL ──────────────────────────────────────────
export function generateDownloadUrl(path) {
  if (!path) throw new Error("Path is required for download");
  return `${BASE_URL}/api/download?path=${encodeURIComponent(path)}`;
}

// ── API: Trigger download ─────────────────────────────────────────────
export function initiateFileDownload(path) {
  try {
    if (!path) {
      throw new Error("Cannot trigger download: The file path is missing.");
    }

    const url = generateDownloadUrl(path);
    const a = document.createElement("a");
    a.href = url;
    a.download = ""; // Let the server set the filename
    document.body.appendChild(a);

    try {
      a.click();
    } finally {
      // Guaranteed DOM cleanup even if browser explicitly blocks simulated click
      document.body.removeChild(a);
      console.log("[download] Triggered & cleaned up:", path);
    }
  } catch (err) {
    console.error("[download] Error:", err);
  }
}