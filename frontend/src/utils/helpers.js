/**
 * File Icon Mapping Constants
 * Returns an emoji representation visually based on the file extension matrix type.
 * @constant {Object}
 */
const ICON_MAP = {
  image: { extensions: ["jpg", "jpeg", "png", "gif", "svg", "webp"], icon: "🖼️" },
  video: { extensions: ["mp4", "mov", "avi", "mkv"], icon: "🎬" },
  audio: { extensions: ["mp3", "wav", "flac"], icon: "🎵" },
  pdf: { extensions: ["pdf"], icon: "📄" },
  archive: { extensions: ["zip", "tar", "gz", "rar"], icon: "🗜️" },
  code: { extensions: ["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "html", "css"], icon: "💻" },
  data: { extensions: ["json", "xml", "yaml", "yml", "csv"], icon: "📋" },
  log: { extensions: ["log"], icon: "📃" },
  text: { extensions: ["txt", "md"], icon: "📝" },
};

/**
 * Derives the appropriate graphical emoji icon for a specific file system payload.
 * 
 * @param {string} name - The exact filename (e.g., 'report.pdf').
 * @param {boolean} isFolder - Boolean flag whether the explicit entity is a directory boundary.
 * @returns {string} The corresponding emoji icon layout to render inside standard UI.
 */
export function getFileIcon(name, isFolder) {
  if (isFolder) return "📁";

  const ext = name.split(".").pop().toLowerCase();

  for (const category of Object.values(ICON_MAP)) {
    if (category.extensions.includes(ext)) return category.icon;
  }

  return "📄"; // Default fallback item renderer
}

/**
 * Formats a raw byte integer output into a human-readable metric string scale length (KB, MB, etc.).
 * 
 * @param {number} bytes - The absolute file magnitude measured strictly in bits/bytes.
 * @returns {string} Highly readable metric definition matrix map (e.g., "1.2 MB"). Returns an em-dash "—" for exactly 0 or null bytes.
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Converts a raw ISO UTC date framework string map into a structurally localized browser representation date vector.
 * 
 * @param {string} isoString - The absolute Date string reference to securely convert payload against.
 * @returns {string} The simplified, browser locally-timezoned display string template standard.
 */
export function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString();
}
