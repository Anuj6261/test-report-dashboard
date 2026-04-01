const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// ── API 1: List directory contents ───────────────────────────────────────────
/**
 * @swagger
 * /api/list:
 *   get:
 *     summary: List directory contents
 *     description: Returns an array of files and folders inside the requested path. Items are sorted with folders first, then files alphabetically.
 *     parameters:
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         description: "The directory path to list, relative to the root data folder (e.g., /test_pipeline_results). Defaults to root (/) if omitted."
 *     responses:
 *       200:
 *         description: Successfully retrieved directory contents
 *       400:
 *         description: Invalid path or the path is a file instead of a directory
 *       404:
 *         description: The specified directory does not exist
 *       500:
 *         description: Server error while reading directory
 */
router.get("/list", fileController.handleListDirectory);

// ── API 2: Read file content ──────────────────────────────────────────────────
/**
 * @swagger
 * /api/file:
 *   get:
 *     summary: Read file contents
 *     description: Returns the raw text/plain content of a requested file. Maximum file size allowed is 5MB.
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: "The exact path to the file to read (e.g., /test_pipeline_results/summary.json)"
 *     responses:
 *       200:
 *         description: The raw text content of the file
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid file path or path points to a directory
 *       404:
 *         description: The requested file could not be found
 *       413:
 *         description: File content too large (exceeds 5MB)
 *       500:
 *         description: Server error while reading file
 */
router.get("/file", fileController.handleReadFileContent);

// ── API 3: Download file or folder ───────────────────────────────────────────
/**
 * @swagger
 * /api/download:
 *   get:
 *     summary: Download a file or folder
 *     description: Downloads a single file as a binary stream, or zips and downloads an entire folder.
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: "The path of the file to download or the folder to zip and download"
 *     responses:
 *       200:
 *         description: Binary file stream or zipped folder stream
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid path provided for download
 *       404:
 *         description: The requested file or folder does not exist
 */
router.get("/download", fileController.handleDownloadFileOrFolder);

// ── API 4: Health check ──────────────────────────────────────────────────────
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API health check
 *     description: Returns a simple 200 OK status to verify the backend is running and responsive.
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/health", fileController.handleHealthCheck);

module.exports = router;
