const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware")

const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
} = require("../controllers/noteController");

// create note
router.post("/projects/:projectId/notes", protect, createNote);
// get all notes 
router.get("/projects/:projectId/notes", protect, getAllNotes);

// get one note by id
router.get("/projects/:projectId/notes/:noteId", protect, getNoteById);

// update note
router.put("/projects/:projectId/notes/:noteId",protect,updateNote)

// delete note
router.delete("/projects/:projectId/notes/:noteId",protect,deleteNote)



module.exports = router;