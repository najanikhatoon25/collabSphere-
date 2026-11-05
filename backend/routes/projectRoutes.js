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
// accept invitation routes 
router.post("/:id/accept-invitation", protect, acceptInvitation);
module.exports = router