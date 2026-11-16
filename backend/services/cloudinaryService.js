const cloudinary = require("../config/cloudinary");

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", type: "authenticated" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (
          !result ||
          !result.public_id ||
          !result.secure_url ||
          !result.resource_type
        ) {
          reject(new Error("Cloudinary returned incomplete upload metadata"));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

const deleteAsset = (publicId, resourceType) =>
  cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

const getAuthenticatedDownloadUrl = ({ publicId, resourceType, originalName }) => {
  const extension = originalName?.includes(".")
    ? originalName.split(".").pop()
    : "";

  return cloudinary.utils.private_download_url(publicId, extension, {
    resource_type: resourceType || "auto",
    type: "authenticated",
    attachment: true,
  });
};

const downloadAsset = async ({ publicId, resourceType, originalName }) => {
  const signedDownloadUrl = getAuthenticatedDownloadUrl({
    publicId,
    resourceType,
    originalName,
  });

  const response = await fetch(signedDownloadUrl);
  if (!response.ok) {
    throw new Error("Unable to fetch the file from Cloudinary");
  }

  return response.arrayBuffer();
};

module.exports = {
  uploadBuffer,
  deleteAsset,
  getAuthenticatedDownloadUrl,
  downloadAsset,
};
