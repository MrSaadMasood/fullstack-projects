const { ObjectId, MongoClient } = require("mongodb");
const { connectData , getData} = require("../connection")
require("dotenv").config()
let database;

connectData((err)=>{
    if(!err) database = getData()
})

exports.getUserData = async(req, res)=>{
    try {
        const users = await database.collection("users").find({}, { projection : { fullName : 1}, sort : { fullName : 1}} ).toArray()
        res.json({ users })
    } catch (error) {
        res.send(400).json({ error : "error occured while getting users"})
    }
}

exports.sendFollowRequest = async( req, res)=>{
    const { senderId, receiverId } = req.body
    const client = new MongoClient(process.env.MONGO_URL)
    const result = sendingRequestsTransaction(client, senderId, receiverId)
    if(result){
        res.json({ message : "request successfully sent"})
    }
    else {
        res.status(400).json({ error : "cannot sent the request"})
    }
}

async function sendingRequestsTransaction(client, senderId, receiverId){

    const session = client.startSession()
    const transactionOptions = {
        writeConcern : {w : "majority"},
        maxCommitTimeMs : 1000
    }
    try {
        session.startTransaction()
        const database = client.db("chat-app")

        await database.collection("users").updateOne({ _id : new ObjectId(senderId)}, {
            $push : {sentRequests : new ObjectId(receiverId)}
        }, transactionOptions)

        await database.collection("users").updateOne({ _id : new ObjectId(receiverId)}, { 
            $push : { receivedRequests : new ObjectId(senderId)}
        }, transactionOptions)

        await session.commitTransaction()
        console.log("transaction completed successfully")
        return true
    } catch (error) {
       console.log("error occured while sending requests transaction")
       await session.abortTransaction() 
       return false
    }
    finally{
        await session.endSession()
    }
}