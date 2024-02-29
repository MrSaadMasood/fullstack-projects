const jwt = require("jsonwebtoken")

// to generate the access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: "15m" });
}



module.exports = {
    generateAccessToken
}
