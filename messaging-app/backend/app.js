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
const path = require("path")

const io = new Server(server , {
    cors : {
        origin : "http://localhost:5173"
    }
})
app.use(cors({
    origin : "http://localhost:5173"
}))
app.use(express.json())
app.use(express.urlencoded({ extended : false}))

connectData((err)=>{
    if(!err){
        server.listen(PORT , ()=> console.log("the server is connected at port", PORT))
    }
    else console.log(err)
})

app.use("/auth-user", authIndex )

app.use(express.static("uploads"))

app.use("/user", authenticateUser , userRouter)

app.get("/images/:name", (req ,res)=>{
    const { name } = req.params
    console.log("the requst is made to get the chat images");
    const filepath = path.join(__dirname, `./uploads/chat-images/${name}.jpg`)
    res.sendFile(filepath)
} )

io.on("connection" , (socket)=>{
    console.log("connected to the socket")

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

function authenticateUser(req, res, next){
    const authHeader = req.headers.authorization
    const accessToken = authHeader.split(" ")[1]
    jwt.verify(accessToken, process.env.ACCESS_SECRET, (err, user)=>{
        if(err) return res.status(401).json({ error : "failed to authenticate user"})
        req.user = user
        next()
    }) 
}