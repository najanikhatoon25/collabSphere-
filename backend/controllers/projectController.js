const Project = require("../models/Project");
const crypto = require("crypto");

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
      $or: [
        { owner: req.user._id },
        {
          members: {
            $elemMatch: {
              user: req.user._id,
              status: "accepted"
            }
          }
        }
      ]
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
      $or: [
        { owner: req.user._id },
        {
          members: {
            $elemMatch: {
              user: req.user._id,
              status: "accepted"
            }
          }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you don't have access"
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


// Add Member / Create Invitation
const addMember = async (req, res) => {
  try {
    const { name, email } = req.body;

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

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        message: "You are already the project owner"
      });
    }

    const existingMember = project.members.find(
      (member) => member.email === normalizedEmail
    );

    if (existingMember) {
      return res.status(400).json({
        message: "Invitation already exists for this email"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    project.members.push({
      name: name.trim(),
      email: normalizedEmail,
      user: null,
      status: "pending",
      inviteTokenHash: tokenHash,
      inviteExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await project.save();

    res.status(201).json({
      message: "Invitation created successfully",
      invitationToken: token
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create invitation",
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

// accept invitation 

const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Invitation token is required"
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const member = project.members.find(
      (item) => item.email === req.user.email.toLowerCase()
    );

    if (!member || member.status !== "pending") {
      return res.status(400).json({
        message: "No pending invitation found for your account"
      });
    }

    if (member.inviteExpiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired"
      });
    }

    if (member.inviteTokenHash !== tokenHash) {
      return res.status(400).json({
        message: "Invalid invitation token"
      });
    }

    member.user = req.user._id;
    member.status = "accepted";
    member.inviteTokenHash = null;
    member.inviteExpiresAt = null;

    await project.save();

    res.status(200).json({
      message: "Invitation accepted. You now have project access."
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to accept invitation",
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
  removeMember,
  acceptInvitation
};