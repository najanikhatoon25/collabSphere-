const express = require("express");
const router=express.Router()

const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  previewInvitation,
  acceptInvitation
} = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware")

// create project api

router.post("/",protect,createProject)
//  get all project
router.get("/",protect,getMyProjects)
// get single project using id 
router.get("/:id", protect, getProjectById);
// update project 
router.put("/:id",protect,updateProject)
// delete route
router.delete("/:id", protect, deleteProject);
// Add Member to Project
router.post("/:id/members", protect, addMember);
// remove member
router.delete("/:id/members/:memberId", protect, removeMember);
// Invitation details and acceptance use the bearer invitation token.
router.post("/:id/invitation-preview", previewInvitation);
router.post("/:id/accept-invitation", acceptInvitation);
module.exports = router;