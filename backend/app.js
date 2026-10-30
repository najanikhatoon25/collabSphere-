const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// middleware
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(cookieParser())

// Test route 
app.get("/",(req,res) => {
    res.status(200).json({
        message:"welom to collabsphere API"
    })
})
module.exports = app;