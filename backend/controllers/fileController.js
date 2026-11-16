const fs=require("fs")
const path=require("path")

const Project=require("../models/Project")
const ProjectFile=require("../models/ProjectFile")
const {
  uploadBuffer,
  deleteAsset,
  downloadAsset,
} = require("../services/cloudinaryService")

// user is project owner or accepted member
const checkProjectAccess =(project,req) =>{
    if (req.inviteSession) {
        return (
            req.inviteSession.projectId === project._id.toString() &&
            project.members.some(
                (member) =>
                    member._id.toString() === req.inviteSession.memberId &&
                    member.status === "accepted"
            )
        )
    }

    const userId = req.user._id;
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
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!checkProjectAccess(project, req)) {
      return res.status(403).json({
        message: "You are not allowed to access this project"
      });
    }

    const uploadedAsset = await uploadBuffer(req.file.buffer);

    let file;
    try {
      file = await ProjectFile.create({
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        project: projectId,
        uploadedBy: req.user._id,
        cloudinaryPublicId: uploadedAsset.public_id,
        cloudinarySecureUrl: uploadedAsset.secure_url,
        cloudinaryResourceType: uploadedAsset.resource_type
      });
    } catch (error) {
      try {
        await deleteAsset(uploadedAsset.public_id, uploadedAsset.resource_type);
      } catch (cleanupError) {
        console.error("Cloudinary upload rollback failed", {
          name: cleanupError.name,
          httpCode: cleanupError.http_code
        });

        return res.status(500).json({
          message: "File upload failed and Cloudinary cleanup was unsuccessful."
        });
      }

      throw error;
    }

    return res.status(201).json({
      message: "File uploaded successfully",
      file
    });
  } catch (error) {
    return res.status(500).json({
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

    if (!checkProjectAccess(project, req)) {
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

    if (!checkProjectAccess(project, req)) {
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

    if (file.cloudinaryPublicId) {
      try {
        const buffer = await downloadAsset({
          publicId: file.cloudinaryPublicId,
          resourceType: file.cloudinaryResourceType || "auto",
          originalName: file.originalName,
        });

        const contentType = file.mimeType || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${file.originalName.replace(/"/g, "'")}"`
        );

        return res.send(Buffer.from(buffer));
      } catch (downloadError) {
        return res.status(502).json({
          message: "File could not be downloaded from Cloudinary."
        });
      }
    }

    const fullPath = path.resolve(file.filePath);

    if (!file.filePath || !fs.existsSync(fullPath)) {
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

    if (req.inviteSession) {
      return res.status(403).json({
        message: "Invited members cannot delete files"
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!checkProjectAccess(project, req)) {
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

    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the project owner can delete files"
      });
    }

    if (file.cloudinaryPublicId) {
      try {
        const cloudinaryResult = await deleteAsset(
          file.cloudinaryPublicId,
          file.cloudinaryResourceType || "auto"
        );

        if (cloudinaryResult?.result === "not found") {
          // No-op: asset is already absent, but metadata should still be removed.
        }
      } catch (cloudinaryError) {
        return res.status(502).json({
          message: "Cloudinary file deletion failed. The metadata was not removed."
        });
      }
    } else if (file.filePath) {
      const fullPath = path.resolve(file.filePath);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
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