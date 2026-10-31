const jwt = require("jsonwebtoken")

const generateToken=(userId) => {
    return jwt.sign(
        {id:userId},
        process.env.jwt_SECRET,
        {expiresIn:process.env.jwt_EXPIRES_IN}
    )
};

module.exports=generateToken