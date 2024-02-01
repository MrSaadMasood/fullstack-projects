const bcrypt = require("bcrypt")
const {connectData, getData} = require("../connection");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken")
require("dotenv").config()

let database;

connectData((err)=>{
    if(!err){
        database = getData()
    }
})

exports.createUser =(req, res)=>{
    const result = validationResult(req)
    const { fullName, email, password} = req.body
    if(result.isEmpty()){
        bcrypt.hash(password, 10, async(err, hashedPassword)=>{
            if (err) return console.log("error occured while hashing")
            try {
                const user  = await database.collection("users").insertOne(
                    { fullName : fullName, email : email, password : hashedPassword}
                )
                if(!user) throw new Error
                return res.json({message : "user successfully created"})
            } catch (error) {
               res.status(400).json({error : "the user could not be created"}) 
            }
        })         
        }
}

exports.loginUser = async(req,res)=>{
    const result = validationResult(req)
    const { email , password} = req.body
    if(result.isEmpty()){
        try {
            const user = await database.collection("users").findOne(
                { email : email}
            )
            if(!user) throw new Error
            console.log("this is here")
            const match = await bcrypt.compare(password, user.password)
            if(!match) return res.status(404).json({message : "user not found"})
            const accessToken = generateAccessToken({ id : user._id})
            if(!accessToken) return res.status(412).json({ error : "cannot log in the user" })
            const refreshToken = jwt.sign({ id : user._id}, process.env.REFRESH_SECRET)
            if(!refreshToken) return res.status(412).json({ error : "cannot log in the user"})
            try {
                console.log(typeof refreshToken);
                const tokenStore = await database.collection("tokens").insertOne({ token : refreshToken})
                console.log("now the request is here");
                res.json({ accessToken, refreshToken})
            } catch (error) {
               res.status(404).json({ error : "login failed"})
            }
        } catch (error) {
            res.status(404).json({error : "user not found"})
        }
    }
}

exports.refreshUser = async( req, res)=>{
    const { refreshToken } = req.body
    try {
        const tokenCheck = await database.collection("tokens").findOne({ token : refreshToken})
        if(!tokenCheck) return res.status(400).json({ error : "cannot refresh the token"})
        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, data)=>{
            if(err) return res.sendStatus(400)
            console.log("the data in the refresh token is ", data)
            const accessToken = generateAccessToken(data)
            if(!accessToken) return res.sendStatus(400)
            res.json({ accessToken })
        })
    } catch (error) {
        res.status(400).json({ error : "cannot refresh the token"})
    }
}

exports.logoutUser = async(req, res)=>{
    const { refreshToken } = req.body
    try {   
        const deleteToken = await database.collection("tokens").deleteOne({ token : refreshToken})
        res.json({ message : "user successfully logged out"})
    } catch (error) {
        res.status(400).json({ error : "logout failed"})
    }
}
function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn : "15m"})
}