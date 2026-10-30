const mongoose = require("mongoose");

const userSchema = new mongoose.model(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },

        email:{
            type:String,
            required:true,
            unique:true,
            lowecase:true,
            trim:true     
        },
        password:{
            type:String,
            required:true,
        }
    },

    {
        timestamp:true
    }

)

const User = mongoose.model("User",userSchema)
module.exports=User