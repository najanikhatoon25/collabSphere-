const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

// login user 

const loginUser = async (req,res) => {
  try{
    const {email,password} = req.body

    // check required field 

    if(!email || !password){
      return res.status(400).json({
      message:"email and password are required"
      })
    }
    // find user by email
    const user = await User.findOne({email})

    if(!user){
      return res.status(401).json({
        message:"invalid email or password"
      })
    }

    // compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if(!isPasswordCorrect){
      return res.status(401).json({
        message:"invalid email or password"
      })
    }

    // generate token 
    const token = generateToken(user._id)

    // send response 
    res.status(200).json({
      message:"login successful",
      token,
      user:{
        id:user._id,
        name:user.name,
        email:user.email
      }
    })
  }catch(error){
    res.status(500).json({
      message:"login failed",
      error:error.message
    })
  }
}

module.exports = { registerUser };