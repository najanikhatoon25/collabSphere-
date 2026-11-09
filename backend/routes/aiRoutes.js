const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  explainContent,
  generateReadme,
  reviewCode,
  explainRepository
} = require("../controllers/aiController");

router.post("/explain", protect, explainContent);
router.post("/generate-readme", protect,generateReadme);
router.post("/explain-repository", protect, explainRepository);
module.exports = router;
