const Project = require("../models/Project");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendInvitationEmail } = require("../services/emailService");

const hideInvitationSecrets = (project) => {
  const projectData = project.toObject();
  projectData.members = projectData.members.map(
    ({ inviteTokenHash, inviteExpiresAt, ...member }) => member
  );
  return projectData;
};

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
    if (req.inviteSession) {
      const project = await Project.findById(req.inviteSession.projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      return res.status(200).json({
        message: "Projects fetched successfully",
        projects: [hideInvitationSecrets(project)]
      });
    }

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
    const project = req.inviteSession
      ? req.inviteSession.projectId === req.params.id
        ? await Project.findById(req.params.id)
        : null
      : await Project.findOne({
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
      project: req.inviteSession ? hideInvitationSecrets(project) : project
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

    try {
      const inviteLink = await sendInvitationEmail({
        to: normalizedEmail,
        projectName: project.name,
        projectId: project._id.toString(),
        token
      });

      return res.status(201).json({
        message: "Invitation created successfully",
        emailSent: true
      });
    } catch (emailError) {
      project.members = project.members.filter((member) => member.email !== normalizedEmail);
      await project.save();

      return res.status(503).json({
        message: emailError.code === "EMAIL_NOT_CONFIGURED"
          ? emailError.message
          : "Invitation email could not be delivered. Check the SMTP settings and try again."
      });
    }

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

const findPendingInvitation = async (projectId, token) => {
  if (typeof token !== "string" || !token) {
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const project = await Project.findById(projectId);

  if (!project) {
    return null;
  }

  const member = project.members.find(
    (item) => item.inviteTokenHash === tokenHash && item.status === "pending"
  );

  if (!member || !member.inviteExpiresAt || member.inviteExpiresAt < new Date()) {
    return null;
  }

  return { project, member };
};

const previewInvitation = async (req, res) => {
  try {
    const invitation = await findPendingInvitation(req.params.id, req.body.token);

    if (!invitation) {
      return res.status(400).json({
        message: "This invitation is invalid, expired, or already accepted."
      });
    }

    return res.status(200).json({
      project: {
        id: invitation.project._id,
        name: invitation.project.name
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to verify this invitation."
    });
  }
};

// Accept an invitation using its bearer token.
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    const invitation = await findPendingInvitation(req.params.id, token);

    if (!invitation) {
      return res.status(400).json({
        message: "This invitation is invalid, expired, or already accepted."
      });
    }

    const { project, member } = invitation;
    const inviteSessionToken = jwt.sign(
      {
        type: "project-invite",
        projectId: project._id.toString(),
        memberId: member._id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    const now = new Date();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const updateResult = await Project.updateOne(
      {
        _id: project._id,
        members: {
          $elemMatch: {
            _id: member._id,
            inviteTokenHash: tokenHash,
            status: "pending",
            inviteExpiresAt: { $gt: now }
          }
        }
      },
      {
        $set: {
          "members.$.user": null,
          "members.$.status": "accepted",
          "members.$.inviteTokenHash": null,
          "members.$.inviteExpiresAt": null
        }
      }
    );

    if (updateResult.modifiedCount !== 1) {
      return res.status(400).json({
        message: "This invitation is invalid, expired, or already accepted."
      });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
    res.cookie("inviteSession", inviteSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Invitation accepted. You now have project access.",
      projectId: project._id
    });

  } catch (error) {
    return res.status(500).json({
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
  previewInvitation,
  acceptInvitation
};