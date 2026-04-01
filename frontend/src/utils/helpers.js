/**
 * Formats a file size in bytes to a human-readable string (B, KB, MB).
 * 
 * @param {number} bytes - The file size in bytes.
 * @returns {string} Formatted file size representation.
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Converts an ISO date string into a local display date.
 * 
 * @param {string} isoString - The ISO date string.
 * @returns {string} Formatted local date string.
 */
export function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString();
}
