const { ObjectId, MongoClient } = require("mongodb");
const { connectData , getData} = require("../connection");
const { validationResult } = require("express-validator");
require("dotenv").config

const transactionOptions = {
    writeConcern : { w : "majority"},
    maxCommitTimeMs : 1000
}

let database;

connectData((err)=>{
    if(!err) database = getData()
})

exports.getUpdatedData = async(req, res)=>{
    const { id } = req.user
    try {
        const updatedData = await database.collection("users").findOne(
            { _id : new ObjectId(id)}
        )
        res.json({ updatedData})
    } catch (error) {
        res.status(400).json({ error : "could not get the updated user"})
    }
}

exports.getUsersData = async(req, res)=>{
    try {
        const users = await database.collection("users").find({}, { projection : { fullName : 1}, sort : { fullName : 1}} ).toArray()
        res.json({ users })
    } catch (error) {
        res.send(400).json({ error : "error occured while getting users"})
    }
}

exports.sendFollowRequest = async( req, res)=>{
    const { receiverId } = req.body
    const { id } = req.user
    const client = new MongoClient(process.env.MONGO_URL)
    const result = await sendingRequestsTransaction(client, id, receiverId)
    if(result){
        res.json({ message : "request successfully sent"})
    }
    else {
        res.status(400).json({ error : "cannot sent the request"})
    }
}

exports.getFriends = async(req, res)=>{
    const { id } = req.user
    const friends = await getCustomData(id, "friends")
    if(friends && friends.length > 0){
        res.status(200).json({ friends})
    }
    else {
        res.status(400).json({ error : "failed to get friends"})
    }
}

exports.getFollowRequests = async(req, res)=>{
    const { id } = req.user
    const receivedRequests = await getCustomData(id, "receivedRequests")
    if(receivedRequests && receivedRequests.length > 0){
        return res.json({ receivedRequests })
    }
    else {
        return res.status(400).json({ error : "failed to get the follow requests" })
    }
}

exports.addFriend = async(req, res)=>{
    const { id } = req.user
    const { friendId } = req.body
    const client = new MongoClient(process.env.MONGO_URL)
    const result = await addFriendTransaction(client , id, friendId)
    if(result){
        res.json({message : "successfully added friend"})
    }
    else {
        res.status(400).json({ error : "failed to add friend"})
    }
}

exports.removeFriend = async(req, res)=>{
    const { id } = req.user
    const friendId = req.params.id 
    const client = new MongoClient(process.env.MONGO_URL)
    const result = await removeUserTransaction(client , id, friendId)

    if(result){
        res.json({message : "successfully added friend"})
    }
    else {
        res.status(400).json({ error : "failed to add friend"})
    }
}


exports.removeFollowRequest = async(req, res) =>{
    const idToRemove = req.params.id
    const { id } = req.user
    const client = new MongoClient(process.env.MONGO_URL)
    const result = await removeFollowRequestTransaction( client, id, idToRemove)

    if(result){
        res.json({message : "successfully added friend"})
    }
    else {
        res.status(400).json({ error : "failed to add friend"})
    }
}

exports.updateChatData = async (req, res)=>{
    const { id} = req.user
    const { friendId, content } = req.body
    const passed = validationResult(req)

        if(passed.isEmpty()){
            
            const client = new MongoClient(process.env.MONGO_URL)
            const result = await updateChatMessageTransaction(client, id, friendId, content)
            if(result){
                res.json({ id : result})
            }
            else {
                res.status(400).json({ error : "failed to add chat"})
            }
        }
}

exports.getChatData = async (req, res) =>{
    const { id} = req.user
    const friendId  = req.params.id
    try {
        const user = await database.collection("users").findOne({ _id : new ObjectId(id)})
        if( !user.normalChats ){
            return res.status(400).json({ error : "no chats are present in the database"})
        }
        if( user.normalChats){

            for(let i = 0; i < user.normalChats.length; i++){
                const iter = user.normalChats[i]
                if(iter.friendId.toString() === friendId){
                    const chatData = await database.collection("normalChats").findOne(
                        { _id : new ObjectId(iter.collectionId.toString())}
                    )
                    return res.json({ chatData})
                }
            }
        }
        throw new Error
    } catch (error) {
        console.log("erro occured while while getting chatData")
        res.status(400).json({ error : "could not collect chat data"})
    }
}

exports.getChatList = async(req, res) =>{
    const { id} = req.user
    try {
        const user = await database.collection("users").findOne({ _id : new ObjectId(id)})
        if(!user.normalChats) throw new Error
        const chatList = await database.collection("users").aggregate(
            [
                {
                  $match: {
                    _id:  new ObjectId(id),
                  },
                },
                {
                  $unwind: "$normalChats",
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "normalChats.friendId",
                    foreignField: "_id",
                    as: "friendsData",
                  },
                },
                {
                  $lookup: {
                    from: "normalChats",
                    localField: "normalChats.collectionId",
                    foreignField: "_id",
                    as: "messages",
                  },
                },
                {
                  $addFields: {
                    lastMessages: {
                      $arrayElemAt: ["$messages.chat", -1],
                    },
                  },
                },
                {
                  $addFields: {
                    lastMessage: {
                      $arrayElemAt: ["$lastMessages", -1],
                    },
                    friendData: {
                      $arrayElemAt: ["$friendsData", -1],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    lastMessage: 1,
                    friendData: {
                      fullName: "$friendData.fullName",
                      _id : "$friendData._id",
                    },
                  },
                },
              ]
        ).toArray()
        res.json({ chatList })
    } catch (error) {
        res.status(400).json({ error : "failed to get the chat list"})
    }
}


async function getCustomData(id, type){
    try {
        const user = await database.collection("users").findOne({ _id : new ObjectId(id)})
       const  data= await database.collection("users").find(
        {
            _id : { $in : user[type]}
        },
        {
            projection : {
                fullName : 1
            }
        }
       ).toArray()
       return data
    } catch (error) {
       console.log("cannot get the custom data") 
       return
    }
}

async function sendingRequestsTransaction(client, senderId, receiverId){

    const session = client.startSession()

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
        return true
    } catch (error) {
       await session.abortTransaction() 
       return false
    }
    finally{
        await session.endSession()
    }
}


async function addFriendTransaction( client, acceptorId, friendId){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        await database.collection("users").updateOne(
            { _id : new ObjectId(acceptorId)},
            {
                    $push : { friends : new ObjectId(friendId)},
                    $pull : { receivedRequests : new ObjectId(friendId)}
            }, transactionOptions
        )
        await database.collection("users").updateOne(
            {
                _id : new ObjectId(friendId)
            },
            {
                    $push : { friends : new ObjectId(acceptorId)},
                    $pull : { sentRequests : new ObjectId(acceptorId)}
                }, transactionOptions
        )
        await session.commitTransaction()
        return true
    } catch (error) {
        await session.abortTransaction()
        return false
    }
    finally {
        await session.endSession()
    }
}


async function removeUserTransaction(client, userId, idToRemove){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        
        await database.collection("users").updateOne(
            { _id : new ObjectId(userId)}, 
            { $pull : { friends : new ObjectId(idToRemove)}},
            transactionOptions
        )

        await database.collection("users").updateOne(
            { _id : new ObjectId(idToRemove)},
            { $pull : { friends : new ObjectId(userId)} },
            transactionOptions
        )

        await session.commitTransaction()
        return true
    } catch (error) {
        console.log("transaction to remove the friend failed")
        await session.abortTransaction()
        return false
    }
    finally {
        await session.endSession()
    }
}

async function removeFollowRequestTransaction(client, userId, idToRemove){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        
        await database.collection("users").updateOne(
            { _id : new ObjectId(userId)},
            { $pull : { receivedRequests : new ObjectId(idToRemove)}}
        )

        await database.collection("users").updateOne(
            { _id : new ObjectId(idToRemove)},
            { $pull : { receivedRequests : new ObjectId(userId)}}
        )

        await session.commitTransaction()
        return true
    } catch (error) {
        console.log("error occured while removing the follow request")
        await session.abortTransaction()
        return false
    }
    finally{
        session.endSession()
    }
}
async function updateChatMessageTransaction(client, userId, friendId, content){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        const randomObjectId = new ObjectId()

        const user = await database.collection("users").findOne({ _id : new ObjectId(userId)})
        if(user.normalChats){
            for(let i = 0; i < user.normalChats.length ; i++){
                if(user.normalChats[i].friendId.toString() === friendId){
                    const chat = await database.collection("normalChats").updateOne(
                        { _id : new ObjectId(user.normalChats[i].collectionId.toString())},
                        {
                            $push : {
                                chat : {
                                    userId : new ObjectId(userId),
                                    time : new Date(),
                                    content : content,
                                    id : randomObjectId 
                                }
                            }
                        },
                        transactionOptions
                    )
                    console.log("the chat inserted is ", chat);
                    await session.commitTransaction()
                    return randomObjectId.toString()
                }
            }
            
        }
        
        const newChat = await database.collection("normalChats").insertOne(
            { chat : [{
                userId : new ObjectId(userId),
                time : new Date(),
                content : content,
                id : randomObjectId 
            }]
        },
        transactionOptions
        )   
        const chatId = newChat.insertedId.toString()
        const addChatIdToUser = await updateUserNormalChat(database, userId, friendId, chatId)
        const addChatIdToFriend = await updateUserNormalChat(database, friendId, userId , chatId)

        if(!addChatIdToUser || !addChatIdToFriend) throw new Error

        await session.commitTransaction()
        return randomObjectId.toString()
    } catch (error) {
        await session.abortTransaction()
        return false
    }
    finally{
        await session.endSession()
    }
}

async function updateUserNormalChat(database, userId ,friendId, chatId){
    try {
        const user = await database.collection("users").updateOne(
            { _id : new ObjectId(userId)},
            { $push : {
                normalChats : {
                    friendId : new ObjectId(friendId),
                    collectionId : new ObjectId(chatId)
                }
            } 
        }
    )
    return true
    } catch (error) {
        console.log("failed to add to the chat", error)
        return false
    }
}