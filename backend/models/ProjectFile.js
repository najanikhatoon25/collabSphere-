const mongoose = require("mongoose");

const projectFileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true
    },

    fileName: {
      type: String
    },

    filePath: {
      type: String
    },

    cloudinaryPublicId: {
      type: String,
      required: function () {
        return !this.filePath;
      }
    },

    cloudinarySecureUrl: {
      type: String,
      required: function () {
        return !this.filePath;
      }
    },

    cloudinaryResourceType: {
      type: String,
      required: function () {
        return !this.filePath;
      }
    },

    mimeType: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const ProjectFile = mongoose.model("ProjectFile", projectFileSchema);

module.exports = ProjectFile;