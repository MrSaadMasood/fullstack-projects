const express = require("express")
const { Server } = require("socket.io")
const http = require("http")
const cors = require("cors")
const app = express()
const authIndex = require("./routes/index.js")
const userRouter = require("./routes/userRouter.js")
const { connectData} = require("./connection.js")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const PORT = process.env.PORT

const server = http.createServer(app)

// creating a new server instance form the above server made with http. this server instance will be used for websockets
const io = new Server(server , {
    cors : {
        origin : process.env.CROSS_ORIGIN
    }
})
app.use(cors({
    origin : process.env.CROSS_ORIGIN
}))

app.use(express.json())
app.use(express.urlencoded({ extended : false}))

// if database connection is successfull then configuring the server to listen to the port
// server.listen(PORT , ()=> console.log("the server is connected at port", PORT))
connectData((err)=>{
    if(!err){
        console.log("successfully connected to the database");
        server.listen(PORT , ()=> console.log("the server is connected at port", PORT))
    }
    else console.log(err)
})

app.use("/auth-user", authIndex )

app.use(express.static("uploads"))

app.use("/user", authenticateUser , userRouter)

// the io instance of the server from the socket.io is used to listen for the connection event
// if connected the socket object / instance will be given which will listen to customized events
io.on("connection" , (socket)=>{

    socket.on("join-room", (oldRoomId, newRoomId)=>{

        if(oldRoomId){
            socket.leave(oldRoomId)
        }
        socket.join(newRoomId)
        socket.emit("joined-chat", newRoomId)
    })

    socket.on("send-message", (roomId, data, chatType, groupChatData)=>{
        socket.to(roomId).emit("received-message", data, chatType, groupChatData )
    })

    socket.on("delete-message", (roomId, messageId, type)=>{
        socket.to(roomId).emit("delete-message", messageId, type)
    })

})

// for the verification of jwt access token
function authenticateUser(req, res, next){
    const authHeader = req.headers.authorization
    const accessToken = authHeader.split(" ")[1]
    jwt.verify(accessToken, process.env.ACCESS_SECRET, (err, user)=>{
        if(err) return res.status(401).json({ error : "failed to authenticate user"})
        req.user = user
        next()
    }) 
}
