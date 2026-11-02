const express = require("express");
const router = express.Router()

const {registerUser,loginUser,getMe,logoutUser} = require("../controllers/authController")

const protect = require("../middleware/authMiddleware")

// register api
router.post("/register",registerUser)

// login api
router.post("/login",loginUser)

// get logged-in user
router.get("/me",protect,getMe)

// logout api
router.post("/logout",logoutUser)

module.exports=router