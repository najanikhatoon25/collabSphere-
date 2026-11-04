const Project = require("../models/Project");

// Create Project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description,
      owner: req.user._id,
      members: []
    });

    res.status(201).json({
      message: "Project created successfully",
      project
    });

  } catch (error) {
    res.status(500).json({
      message: "Project creation failed",
      error: error.message
    });
  }
};


// Get All Projects
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user._id
    });

    res.status(200).json({
      message: "Projects fetched successfully",
      projects
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message
    });
  }
};


// Get Single Project
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      message: "Project fetched successfully",
      project
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project",
      error: error.message
    });
  }
};


// Update Project
const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty"
        });
      }

      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description;
    }

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project
    });

  } catch (error) {
    res.status(500).json({
      message: "Project update failed",
      error: error.message
    });
  }
};


// Delete Project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    await project.deleteOne();

    res.status(200).json({
      message: "Project deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Project deletion failed",
      error: error.message
    });
  }
};


// Add Member to Project
const addMember = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate name and email
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Member name and email are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email"
      });
    }

    // Find project and verify owner
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    // Check duplicate email
    const existingMember = project.members.find(
      (member) => member.email === normalizedEmail
    );

    if (existingMember) {
      return res.status(400).json({
        message: "This person is already a project member"
      });
    }

    // Add member details
    project.members.push({
      name: name.trim(),
      email: normalizedEmail,
      user: null
    });

    await project.save();

    res.status(200).json({
      message: "Member added successfully",
      project
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
      error: error.message
    });
  }
};

// remove member from project 
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const project = await Project.findOne({
      _id: id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    const member = project.members.find(
      (item) => item._id.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({
        message: "Project member not found"
      });
    }

    member.deleteOne();

    await project.save();

    res.status(200).json({
      message: "Member removed successfully",
      project
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to remove member",
      error: error.message
    });
  }
};
module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
