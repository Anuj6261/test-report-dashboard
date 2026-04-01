const fs = require("fs/promises");
const path = require("path");
const { DATA_ROOT } = require("../seed");

// Use process.env if available, otherwise fallback to 5MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880", 10);

// ── Path Validation ───────────────────────────────────────────────────────────
// SECURITY: Prevents path traversal attacks (e.g. ../../etc/passwd)
function safePath(requestedPath) {
  const cleaned = (requestedPath || "").replace(/^[/\\]+/, "") || ".";
  const absolute = path.resolve(DATA_ROOT, cleaned);
  const rootDir = path.resolve(DATA_ROOT);

  if (absolute !== rootDir && !absolute.startsWith(rootDir + path.sep)) {
    return null;
  }
  return absolute;
}

// ── List Directory Contents ───────────────────────────────────────────────────
// Returns sorted array of items (folders first, then alphabetical)
async function getDirectoryContents(targetPath) {
  const entries = await fs.readdir(targetPath);

  const items = await Promise.all(
    entries.map(async (name) => {
      const fullPath = path.join(targetPath, name);
      const entryStat = await fs.stat(fullPath);
      // Return path with forward slashes so frontend works on any OS
      const relativePath = "/" + path.relative(DATA_ROOT, fullPath).split(path.sep).join("/");

      return {
        name,
        path: relativePath,
        isFolder: entryStat.isDirectory(),
        size: entryStat.isDirectory() ? null : entryStat.size,
        modified: entryStat.mtime.toISOString(),
      };
    })
  );

  // Folders first, then files — alphabetical within each group
  items.sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

// ── Read File Content ─────────────────────────────────────────────────────────
// Returns file content as a string. Throws if file is too large.
async function getFileContentString(targetPath) {
  const stat = await fs.stat(targetPath);

  if (stat.size > MAX_FILE_SIZE) {
    const error = new Error("File too large to preview (max 5MB).");
    error.statusCode = 413;
    throw error;
  }

  return await fs.readFile(targetPath, "utf-8");
}

// ── Get Path Info ─────────────────────────────────────────────────────────────
// Returns { exists, isDirectory, stat } for a given path
async function getFileSystemStats(targetPath) {
  try {
    const stat = await fs.stat(targetPath);
    return { exists: true, isDirectory: stat.isDirectory(), stat };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { exists: false, isDirectory: false, stat: null };
    }
    throw err; // Re-throw permission or hardware errors
  }
}

module.exports = {
  safePath,
  getDirectoryContents,
  getFileContentString,
  getFileSystemStats,
  MAX_FILE_SIZE,
};
