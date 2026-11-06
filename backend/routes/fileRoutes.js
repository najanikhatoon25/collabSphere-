const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadFile,
  getAllFiles,
  getFileById,
  deleteFile
} = require("../controllers/fileController");

// Upload file
router.post(
  "/projects/:projectId/files",protect,upload.single("file"),uploadFile);

// Get all files
router.get("/projects/:projectId/files",protect,getAllFiles);

// Download file
router.get("/projects/:projectId/files/:fileId",protect,getFileById);

// Delete file
router.delete("/projects/:projectId/files/:fileId",protect,deleteFile);

module.exports = router;