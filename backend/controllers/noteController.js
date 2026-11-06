const Note = require("../models/Note");
const Project = require("../models/Project");

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { projectId } = req.params;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Note title is required"
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();

    const isMember = project.members.some(
      (member) =>
        member.user &&
        member.user.toString() === req.user._id.toString() &&
        member.status === "accepted"
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content || "",
      project: projectId,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Note created successfully",
      note
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get all notes of a project
const getAllNotes = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check project owner
    const isOwner =
      project.owner.toString() === req.user._id.toString();

    // Check accepted member
    const isMember = project.members.some(
      (member) =>
        member.user &&
        member.user.toString() === req.user._id.toString() &&
        member.status === "accepted"
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    // Get all notes of this project
    const notes = await Note.find({
      project: projectId
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      message: "Notes fetched successfully",
      notes
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get a single note by ID
const getNoteById = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check project owner
    const isOwner =
      project.owner.toString() === req.user._id.toString();

    // Check accepted member
    const isMember = project.members.some(
      (member) =>
        member.user &&
        member.user.toString() === req.user._id.toString() &&
        member.status === "accepted"
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    // Find note inside this project
    const note = await Note.findOne({
      _id: noteId,
      project: projectId
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    res.status(200).json({
      message: "Note fetched successfully",
      note
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update an existing note
const updateNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const { title, content } = req.body;

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check project owner
    const isOwner =
      project.owner.toString() === req.user._id.toString();

    // Check accepted member
    const isMember = project.members.some(
      (member) =>
        member.user &&
        member.user.toString() === req.user._id.toString() &&
        member.status === "accepted"
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    // Find note inside this project
    const note = await Note.findOne({
      _id: noteId,
      project: projectId
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Note title cannot be empty"
        });
      }

      note.title = title.trim();
    }

    // Update content if provided
    if (content !== undefined) {
      if (typeof content !== "string") {
        return res.status(400).json({
          message: "Note content must be text"
        });
      }

      note.content = content;
    }

    await note.save();

    res.status(200).json({
      message: "Note updated successfully",
      note
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete an existing note
const deleteNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check project owner
    const isOwner =
      project.owner.toString() === req.user._id.toString();

    // Check accepted member
    const isMember = project.members.some(
      (member) =>
        member.user &&
        member.user.toString() === req.user._id.toString() &&
        member.status === "accepted"
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    // Find note inside this project
    const note = await Note.findOne({
      _id: noteId,
      project: projectId
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    // Only owner or note creator can delete
    const isCreator =
      note.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        message: "You can only delete your own notes"
      });
    }

    await note.deleteOne();

    res.status(200).json({
      message: "Note deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
};