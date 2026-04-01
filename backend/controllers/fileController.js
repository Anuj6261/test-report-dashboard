const fs = require("fs"); // Kept for createReadStream which is native async
const archiver = require("archiver");
const path = require("path");
const { safePath, getDirectoryContents, getFileContentString, getFileSystemStats } = require("../services/fileService");

// ── API: List directory contents ──────────────────────────────────────────────
const handleListDirectory = async (req, res) => {
  const targetPath = safePath(req.query.path);

  if (!targetPath) {
    return res.status(400).json({ error: "Invalid path provided, or access is restricted." });
  }

  try {
    const info = await getFileSystemStats(targetPath);

    if (!info.exists) {
      return res.status(404).json({ error: "The specified directory does not exist or cannot be accessed." });
    }

    if (!info.isDirectory) {
      return res.status(400).json({ error: "The requested path is a file, but a directory was expected." });
    }

    const items = await getDirectoryContents(targetPath);
    res.json({ path: req.query.path || "/", items });
  } catch (err) {
    console.error("[list] Error:", err);
    res.status(500).json({ error: "Failed to retrieve directory contents. Please check server logs." });
  }
};

// ── API: Read file content ────────────────────────────────────────────────────
const handleReadFileContent = async (req, res) => {
  const targetPath = safePath(req.query.path);

  if (!targetPath) {
    return res.status(400).json({ error: "Invalid file path provided, or access is restricted." });
  }

  try {
    const info = await getFileSystemStats(targetPath);

    if (!info.exists) {
      return res.status(404).json({ error: "The requested file could not be found." });
    }

    if (info.isDirectory) {
      return res.status(400).json({ error: "Cannot read a directory as a file. Please select a file." });
    }

    const content = await getFileContentString(targetPath);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(content);
  } catch (err) {
    console.error("[file] Error:", err);
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || "An unexpected error occurred while reading the file." });
  }
};

// ── API: Download file or folder ──────────────────────────────────────────────
const handleDownloadFileOrFolder = async (req, res) => {
  const targetPath = safePath(req.query.path);

  if (!targetPath) {
    return res.status(400).json({ error: "Invalid path provided for download." });
  }

  try {
    const info = await getFileSystemStats(targetPath);

    if (!info.exists) {
      return res.status(404).json({ error: "The requested file or folder for download does not exist." });
    }

    if (!info.isDirectory) {
      // ── File download ──
      const filename = path.basename(targetPath);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      return fs.createReadStream(targetPath).pipe(res);
    }

    // ── Folder download → streaming zip ──
    const folderName = path.basename(targetPath);
    res.setHeader("Content-Disposition", `attachment; filename="${folderName}.zip"`);
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 6 } });

    archive.on("error", (err) => {
      console.error("[download] Archive error:", err);
      res.end();
    });

    archive.pipe(res);
    archive.directory(targetPath, folderName);
    archive.finalize();
  } catch (err) {
    console.error("[download] Error:", err);
    res.status(500).json({ error: "An unexpected error occurred during download preparation." });
  }
};

// ── API: Health check ─────────────────────────────────────────────────────────
const handleHealthCheck = (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
};

module.exports = {
  handleListDirectory,
  handleReadFileContent,
  handleDownloadFileOrFolder,
  handleHealthCheck,
};
