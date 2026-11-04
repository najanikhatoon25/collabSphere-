const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const authRoutes = require("./routes/authRoutes")
const projectRoutes=require("./routes/projectRoutes")


// middleware
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(cookieParser())

// register user routes 
app.use("/api/auth",authRoutes)  

// project routes 
app.use("/api/projects",projectRoutes)


// Test route 
app.get("/",(req,res) => {
    res.status(200).json({
        message:"welom to collabsphere API"
    })
})

// authetication routes 



module.exports = app;