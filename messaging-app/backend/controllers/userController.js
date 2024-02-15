const { ObjectId, MongoClient } = require("mongodb");
const { connectData , getData} = require("../connection");
const { validationResult } = require("express-validator");
require("dotenv").config
const path = require("path")
const fs = require("fs")

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
            { _id : new ObjectId(id)}, { projection : { password : 0, email : 0}}
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
        else {
            res.status(400).json({ error : "the form was not submitted correctly"})
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
                      profilePicture : "$friendData.profilePicture"
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

exports.saveChatImagePath = async (req, res)=>{
    const { friendId} = req.body
    const { id } = req.user
    const client = new MongoClient(process.env.MONGO_URL)
    const { filename } = req.file
    const filePath = filename
    const result = await updateChatMessageTransaction(client, id, friendId, filePath ,"path")

    if(result){
        res.json({ filename : filename, id : result})
    }
    else {
        res.status(400).json({ error : "failed to add image"})
    }
}

exports.getChatImage = (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/chat-images/${name}`)
    res.sendFile(filepath)
}

exports.changeBio = async(req, res)=>{
    const { id } = req.user
    const { bio } = req.body
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
            const user = await database.collection("users").updateOne(
                {_id : new ObjectId(id)},
                { $set : { bio : bio}}
            )
            res.json({message : "the bio has been successfullly added"})    
        }else throw new Error
    } catch (error) {
        res.status(400).json({ error : "bio update failed"})
    }
}

exports.saveProfilePicturePath = async (req, res)=>{
    const { id} = req.user
    const { filename } = req.file
    
    try {
        const addingProfilePicture = await database.collection("users").updateOne(
            {_id : new ObjectId(id)}, { $set : { profilePicture : filename}}
        )
        res.json({ message : "profile picture successfully added"})
    } catch (error) {
        res.status(400).json({error: "cannot update the profile picture"})
    }
}

exports.getProfilePicture  = async (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/profile-images/${name}`)
    res.sendFile(filepath)
}
exports.deletePrevProfilePicture = (req, res)=>{
    const { name } = req.params
    fs.unlink(`./uploads/profile-images/${name}`, (err)=>{
        if(err){
            return res.status(400).json({ error : "some error occured"}) 
        }
        res.json({ message : "picture successully deleted"})
    })

} 

exports.getFriendsData = async (req, res)=>{
    const {id} = req.user
    console.log("the id is", id);
    try {
        const friendsData = await database.collection("users").aggregate(
            [
                {
                $match: {
                    _id: new ObjectId(id),
                },
                },
                {
                $lookup: {
                    from: "users",
                    localField: "friends",
                    foreignField: "_id",
                    as: "data",
                },
                },
                {
                $unwind: "$data",
                },
                {
                $project: {
                    _id: 0,
                    _id: "$data._id",
                    fullName: "$data.fullName",
                },
                },
            ] 
        ).toArray()
        res.json({ friendsData })
    } catch (error) {
        res.status(400).json({error : "could not get the friendds data"})
    }
}

exports.createNewForm = async (req, res)=>{
    try {
        const { members, groupName} = req.body
        const { id} = req.user
        let filename
        if(req.file){
            filename = req.file.filename
        }

        const membersObjectIds = convertStringArrayToObjectIdsArray(members, id)
        const client = new MongoClient(process.env.MONGO_URL)
        const result = await groupChatTransaction(client,id , membersObjectIds, groupName, filename )
        if(result) {
            res.json({ message : "the group is successfully created"})
        }
        else {
            throw new Error
        }
    } catch (error) {
        res.status(400).json({error : "failed to create a new group"})
    }
}

exports.getGroupChats = async (req, res)=>{
    const {id } = req.user
    try {
        const groupChats = await database.collection("users").aggregate(
            [
                {
                  $match: {
                    _id : new ObjectId(id)
                  }
                },
                { $unwind : "$groupChats"},
                {
                  $lookup: {
                    from: "groupChats",
                    localField: "groupChats.collectionId",
                    foreignField: "_id",
                    as: "chats"
                  }
                },
                { $addFields: {
                  chat: {
                    $arrayElemAt : ["$chats.chat", -1]
                  }
                }
                },
                {
                  $addFields: {
                    lastMessage: {
                      $arrayElemAt : ["$chat", -1]
                    }   
                  }
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "lastMessage.userId",
                    foreignField: "_id",
                    as: "senderDataArray"
                  }
                },
                {
                  $addFields: {
                    senderData: {
                      $arrayElemAt : ["$senderDataArray", -1]
                    }
                  }
                },
                {
                  $project : {
                    _id : "$groupChats.collectionId",
                    groupName : "$groupChats.groupName",
                    groupImage : "$groupChats.groupImage",
                    lastMessage : "$lastMessage",
                    senderName : "$senderData.fullName"
                  }
                }
              ]
        ).toArray()
        res.json({ groupChats })
    } catch (error) {
        res.status(400).json({ error : "cannot get the group chats list"})
    }
}

exports.getGroupPicture = (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/group-images/${name}`)
    res.sendFile(filepath)
}

exports.getGroupChatData = async(req, res)=>{
    const { chatId} = req.params
    try {
        const groupChatData = await database.collection("groupChats").aggregate(
            [
                {
                  $match: {
                    _id: new ObjectId(chatId),
                  },
                },
                {
                  $unwind: "$chat",
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "chat.userId",
                    foreignField: "_id",
                    as: "senderData",
                  },
                },
                {
                  $addFields: {
                    sender: {
                      $arrayElemAt: ["$senderData", -1],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    chat: "$chat",
                    senderName: "$sender.fullName",
                  },
                },
              ]
        ).toArray()
        res.json({ groupChatData})
    } catch (error) {
        res.status(400).json({ error : "failed to get the group chat data"})
    }
}

exports.saveGroupChatImage = async(req, res)=>{
    const { id} = req.user
    const { filename } = req.file
    const { groupId } = req.body
    const result = await updateGroupChat(groupId, id, "path", filename)
    if(result){
        res.json({ filename, id : result})
    }
    else{
        res.status(400).json({error : "failed to update the group chat"})
    }
}
exports.updateGroupChatData = async(req, res)=>{
    const { groupId, content} = req.body
    const { id} = req.user
    const result = await updateGroupChat(groupId, id, "content", content)
    
    if(result){
            res.json({ id : result})
        }
    else{
            res.status(400).json({error : "failed to update the group chat"})
        }
}

exports.deleteMessage = async(req, res)=>{
    const { collectionId, type, messageId } = JSON.parse(req.query.data)
    const collectionName = type === "normal" ? "normalChats" : "groupChats"
    const result = await deleteMessageFromChat(collectionId, messageId, collectionName)
    if(result){
        res.json({ message : "successfully deleted the message"})
    }
    else{
        res.status(400).json({error : "failed to delete the message"})
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
async function updateChatMessageTransaction(client, userId, friendId, content, contentType = "content"){
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
                                    [contentType] : content,
                                    id : randomObjectId 
                                }
                            }
                        },
                        transactionOptions
                    )
                    await session.commitTransaction()
                    return randomObjectId.toString()
                }
            }
            
        }
        
        const newChat = await database.collection("normalChats").insertOne(
            { chat : [{
                userId : new ObjectId(userId),
                time : new Date(),
                [ contentType ] : content,
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

async function groupChatTransaction(client, userId, members, groupName, groupImage){
    const filename = groupImage ? groupImage : null
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        const randomId = new ObjectId()
        const newGroup = await database.collection("groupChats").insertOne(
            {   _id : randomId,
                chat : [
                    {
                        id : new ObjectId(),
                        userId : new ObjectId(userId),
                        time : new Date(),
                        content : "You have been added in the group."
                    }
                ]
             }
        )
            console.log(newGroup)
        const updatingUsers = await database.collection("users").updateMany(
            { _id : { $in : members }},
            {
                $push : {
                    groupChats : { 
                            id : new ObjectId(),
                            members : members,
                            admins : [
                                new ObjectId(userId)
                            ],
                            collectionId : new ObjectId(randomId),
                            groupName : groupName,
                            groupImage : filename
                    }
                }
            }
        )
        session.commitTransaction()
        return true
    } catch (error) {
        session.abortTransaction()
        return false
    }
    finally {
        session.endSession()
    }
}

function convertStringArrayToObjectIdsArray(array, extraMemberToAdd){
        const parsedMembers = JSON.parse(array)
        parsedMembers.push(extraMemberToAdd)
        const membersObjectIds = parsedMembers.map(member =>{
            return new ObjectId(member)
        })
        return membersObjectIds
}

async function updateGroupChat( collectionId, userId, contentType, content){
    try {
        const randomId = new ObjectId()
        const updated = await database.collection("groupChats").updateOne(
            {
                _id : new ObjectId(collectionId)
            },
            { $push : {
                chat : {
                    [contentType ] : content,
                    id : randomId,
                    userId : new ObjectId(userId),
                    time : new Date()
                }
            }}
        )
        return randomId.toString()
    } catch (error) {
        return false
    }
}

async function deleteMessageFromChat(collectionId, messageId, collectionName){
    try {
        const deletedMessage = await database.collection(collectionName).updateOne(
            {_id : new ObjectId(collectionId)},
            { $pull : {
                chat : {
                    id :new ObjectId(messageId) 
                } 
            } 
        }
        )
        console.log(deletedMessage);
        return true
    } catch (error) {
        return false
    }
}