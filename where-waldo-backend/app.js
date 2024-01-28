const express = require("express")
const app = express()
const {connectData, getData} = require("./connection")
const uploadRouter = require("./routes/upload.js")
require("dotenv").config()
const PORT = process.env.PORT
app.use(express.json())
app.use(express.urlencoded({ extended : false}))
app.set("view engine", "ejs")

connectData((err)=>{
    if(err) return
    console.log("database is now connected");
    app.listen(PORT, ()=> console.log("the server is now running at the port", PORT))
})
app.use(express.static("uploads"))
app.use("/upload", uploadRouter)