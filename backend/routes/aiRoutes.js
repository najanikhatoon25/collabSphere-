const express = require("express");
const router = express.Router();

const {
  explainContent,
  generateReadme,
  reviewCode,
  explainRepository
} = require("../controllers/aiController");

// Correct import
const protect = require("../middleware/authMiddleware");

// Explain content
router.post("/explain", protect, explainContent);

// Generate README
router.post("/generate-readme", protect, generateReadme);

// Review code snippet
router.post("/review-code", protect, reviewCode);

// Explain GitHub repository
router.post("/explain-repository", protect, explainRepository);

module.exports = router;