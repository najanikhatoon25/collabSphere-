const mongoose = require("mongoose");

const projectSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },

        description:{
            type:String,
            trim:true,
            default:""
        },

        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true

        },
     members: [
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending"
    },
    inviteTokenHash: {
      type: String,
      default: null
    },
    inviteExpiresAt: {
      type: Date,
      default: null
    }
  }
],
    },
        
        
        
        {timestamps:true}
)


const Project = mongoose.model("Project",projectSchema);
module.exports=Project;