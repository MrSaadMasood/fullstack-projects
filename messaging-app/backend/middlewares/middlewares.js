const jwt = require("jsonwebtoken")
// for the verification of jwt access token
function authenticateUser(req, res, next){
    const authHeader = req.headers.authorization
    if(!authHeader) return res.status(401).json({ error : "failed to authenticate user"})
    console.log("the auth headers obtained are", authHeader)
    const accessToken = authHeader.split(" ")[1]
    jwt.verify(accessToken, process.env.ACCESS_SECRET, (err, user)=>{
        if(err) return res.status(401).json({ error : "failed to authenticate user"})
        req.user = user
        next()
    }) 
}


module.exports = {
    authenticateUser
}