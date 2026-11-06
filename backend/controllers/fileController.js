const fs=require("fs")
const path=require("path")

const Project=require("../models/Project")
const ProjectFile=require("../models/ProjectFile")

// user is project owner or accepted member
const checkProjectAccess =(project,userId) =>{
    const isOwner=project.owner.toString()===userId.toString()

const isMember = project.members.some(
    (member) =>
        member.user &&
        member.user.toString()===userId.toString()&&
        member.status === "accepted"
)

return isOwner || isMember
}

// upload file 
const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file"
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!checkProjectAccess(project, req.user._id)) {
      fs.unlinkSync(req.file.path);

      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    const file = await ProjectFile.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      project: projectId,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file
    });
  } catch (error) {

  // Remove uploaded file if database operation fails
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

  res.status(500).json({
    message: error.message
  });
}
}

// get all files 

const getAllFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!checkProjectAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    const files = await ProjectFile.find({
      project: projectId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      files
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

//  get one file 
const getFileById = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!checkProjectAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    const file = await ProjectFile.findOne({
      _id: fileId,
      project: projectId
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    const fullPath = path.resolve(file.filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        message: "File is missing from server storage"
      });
    }

    return res.download(fullPath, file.originalName);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// delete file 
const deleteFile = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!checkProjectAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    const file = await ProjectFile.findOne({
      _id: fileId,
      project: projectId
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isUploader =
      file.uploadedBy.toString() === req.user._id.toString();

    if (!isOwner && !isUploader) {
      return res.status(403).json({
        message: "You cannot delete this file"
      });
    }

    const fullPath = path.resolve(file.filePath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }

    await file.deleteOne();

    res.status(200).json({
      message: "File deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};module.exports = {
  uploadFile,
  getAllFiles,
  getFileById,
  deleteFile
};