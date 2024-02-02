const express = require("express")
const cors = require("cors")
const app = express()
const authIndex = require("./routes/index.js")
const userRouter = require("./routes/userRouter.js")
const { connectData} = require("./connection.js")
require("dotenv").config()
const jwt = require("jsonwebtoken")

const PORT = process.env.PORT
app.use(cors({
    origin : "http://localhost:5173"
}))
app.use(express.json())
app.use(express.urlencoded({ extended : false}))

connectData((err)=>{
    if(!err){
        app.listen(PORT , ()=> console.log("the server is connected at port", PORT))
    }
    else console.log(err)
})

app.use("/auth-user", authIndex )

app.use("/user", authenticateUser , userRouter)
function authenticateUser(req, res, next){
    const authHeader = req.headers.authorization
    const accessToken = authHeader.split(" ")[1]
    jwt.verify(accessToken, process.env.ACCESS_SECRET, (err, user)=>{
        if(err) return res.status(401).json({ error : "failed to authenticate user"})
        req.user = user
        next()
    }) 
}