// ── Configuration ────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TIMEOUT_MS = parseInt(import.meta.env.VITE_API_TIMEOUT_MS || "30000", 10);
const MAX_RETRIES = parseInt(import.meta.env.VITE_API_MAX_RETRIES || "3", 10);
const RETRY_DELAY_MS = parseInt(import.meta.env.VITE_API_RETRY_DELAY_MS || "1000", 10);

/**
 * ── httpClient ──
 * A clean wrapper around 'fetch' that automatically handles timeouts 
 * and network retries in the background, keeping the rest of the code simple.
 */
async function httpClient(endpoint, options = {}) {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) return response;

      if (response.status >= 400 && response.status < 500) {
        const err = new Error(`Request failed (${response.status})`);
        err.bail = true;
        throw err;
      }

      throw new Error(`Server error (${response.status})`);

    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error.name === "AbortError") {
        throw new Error("Request timed out. The server took too long.");
      }
      if (error.bail) {
        throw error;
      }

      // Wait briefly before looping to try again
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
}

// ── API Functions ─────────────────────────────────────────────────────

export async function getDirectoryContents(path) {
  try {
    const response = await httpClient(`/api/list?path=${encodeURIComponent(path)}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("[API Error] getDirectoryContents:", err);
    throw err;
  }
}

export async function getFileContent(path) {
  try {
    const response = await httpClient(`/api/file?path=${encodeURIComponent(path)}`);
    return await response.text();
  } catch (err) {
    console.error("[API Error] getFileContent:", err);
    throw err;
  }
}

export function initiateFileDownload(path) {
  if (!path) return;
  const url = `${BASE_URL}/api/download?path=${encodeURIComponent(path)}`;

  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}