const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const authRoutes = require("./routes/authRoutes")
const projectRoutes=require("./routes/projectRoutes")
const noteRoutes = require("./routes/noteRoutes");
const fileRoutes = require("./routes/fileRoutes");
const aiRoutes = require("./routes/aiRoutes");


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

// notes route
app.use("/api", noteRoutes);

// file route
app.use("/api",fileRoutes)

// geminii ai route
app.use("/api/ai", aiRoutes);

// Test route 
app.get("/",(req,res) => {
    res.status(200).json({
        message:"welom to collabsphere API"
    })
})




module.exports = app;