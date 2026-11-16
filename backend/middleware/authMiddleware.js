const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");

const protect = async (req, res, next) => {
  const inviteSessionToken = req.cookies.inviteSession;

  if (inviteSessionToken) {
    try {
      const decoded = jwt.verify(inviteSessionToken, process.env.JWT_SECRET);

      if (decoded.type !== "project-invite" || !decoded.projectId || !decoded.memberId) {
        throw new Error("Invalid invitation session");
      }

      const project = await Project.findById(decoded.projectId);
      const member = project?.members.id(decoded.memberId);

      if (!member || member.status !== "accepted") {
        throw new Error("Invitation membership is no longer active");
      }

      req.inviteSession = {
        projectId: project._id.toString(),
        memberId: member._id.toString()
      };
      req.user = {
        _id: member._id,
        name: member.name,
        email: member.email,
        inviteSession: true,
        projectId: project._id.toString()
      };

      return next();
    } catch (error) {
      res.clearCookie("inviteSession", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
    }
  }

  try {
    // Get token from cookie
    const token = req.cookies.token;

    // Check token exists or not
    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login first."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // Attach user to request
    req.user = user;

    // Move to next middleware or controller
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = protect;