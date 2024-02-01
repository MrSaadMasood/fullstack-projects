const express = require("express")
const cors = require("cors")
const app = express()
const authIndex = require("./routes/index.js")
const { connectData} = require("./connection.js")
require("dotenv").config()

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
