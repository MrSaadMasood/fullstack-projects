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

// sends the userData to the client based on the user id
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

// get the full name and id of all users from the database
exports.getUsersData = async(req, res)=>{
    try {
        const users = await database.collection("users").find({}, { projection : { fullName : 1}, sort : { fullName : 1}} ).toArray()
        res.json({ users })
    } catch (error) {
        res.send(400).json({ error : "error occured while getting users"})
    }
}

// adds the sender id to the receivers received requests array
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

// get the firends data from the database
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

// gets the follow request from the database
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

// adds the friends to the user
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

// removes the friend from the friends array
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

// remove the follow request if one does not want to add the friend
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

// validates the data sent and then adds the chat message to that friends chat collection
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

// the the chat data with the friend does not exist it throw and error and sends 400 http status
// if the chats exists it checks which friends id matches the friend id in normal chats and
// fetches the data from the "normalChats" collection
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

// uses aggregation pipeline to get the friends name and their last messages sent
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

// saves the filename to the database. same as the add message transaction but here the path field is used instead of "content".
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

// gets the image from the server static files and sends it
exports.getChatImage = (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/chat-images/${name}`)
    res.sendFile(filepath)
}

// updates the bio of the user
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

// adds the profile picture name to the users document
exports.saveProfilePicturePath = async (req, res)=>{
    const { id} = req.user
    const { filename } = req.file
    
    try {
        const addingProfilePicture = await database.collection("users").updateOne(
            {_id : new ObjectId(id)}, 
            { $set : { 
                profilePicture : filename
            }
            }
        )
        res.json({ message : "profile picture successfully added"})
    } catch (error) {
        res.status(400).json({error: "cannot update the profile picture"})
    }
}

// gets the static profile picture to the user
exports.getProfilePicture  = async (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/profile-images/${name}`)
    res.sendFile(filepath)
}

// deletes the previous profile picture of the user
exports.deletePrevProfilePicture = (req, res)=>{
    const { name } = req.params
    fs.unlink(`./uploads/profile-images/${name}`, (err)=>{
        if(err){
            return res.status(400).json({ error : "some error occured"}) 
        }
        res.json({ message : "picture successully deleted"})
    })

} 

// gets the data of all the friends.
exports.getFriendsData = async (req, res)=>{
    const {id} = req.user
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

// creates a new group form the given information
exports.createNewForm = async (req, res)=>{
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
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

        }
        else throw new Error
    } catch (error) {
        res.status(400).json({error : "failed to create a new group"})
    }
}

// gets the group names and the last message in the group and the username that sent the message
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

// sends the group picture to the client
exports.getGroupPicture = (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/group-images/${name}`)
    res.sendFile(filepath)
}

// gets all the messages of a specific group chat
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

// saves the image name in the chat document
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

// updates the message send sent in the database
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

// depending upon the chat type the collection name is decided and the message is deleted from the database
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

// gets used to get the friends and received requests based on type provided
async function getCustomData(userId, type){

    try {
        const user = await database.collection("users").findOne({ _id : new ObjectId(userId)})
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

// a tranasaction where the senders sent requests array and the receivers receive request array are updated in an atomic way
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

// it adds the friend id to the users friends array and removes the friend id from the recerived requests array
// removes the id from sent request of the friend and adds the user id to the friends array
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

// removes the friend from the friends array from both the user and the other friend
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

// removes the users id from the sent requests and the sender ids from the received requests array
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
            { $pull : { sentRequests : new ObjectId(userId)}}
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

// it gets th user and checks if the user normalChats array is present. if present, loop over the users normal chats array
// finds the id that matches the friends id and gets the collection id from that object and updates the collection
// and returns that added objects id in "normalChats" collection
async function updateChatMessageTransaction(client, userId, friendId, content, contentType = "content"){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        const randomObjectId = new ObjectId()

        const user = await database.collection("users").findOne({ _id : new ObjectId(userId)})
        if(user.normalChats){
            const index = user.normalChats.findIndex((element)=>element.friendId.toString() === friendId )
            if(index !== -1){
                const collectionId = user.normalChats[index].collectionId.toString()
                const chat = await database.collection("normalChats").updateOne(
                    { _id : new ObjectId(collectionId)},
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
        
        // if normal chats array does not exist it creates a new document in the "normalChats" collection adds the message to it
        // then adds the Id of the newly created document to both the users and friends normal chats array
        // and returns the id of the newly added message in "normals chats" collection's document
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

// updates the normal chats array and adds the friend id and the "normalChats" collection document id in the array
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

// creates a new group and adds a messages to in the chat and then adds the id of the document in the "groupChats" collection
// to all the members in the members array
// if group image is not provided null is added in the field
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

// convets an arrya of strings to object ids that can be used for querying
function convertStringArrayToObjectIdsArray(array, extraMemberToAdd){
        const parsedMembers = JSON.parse(array)
        parsedMembers.push(extraMemberToAdd)
        const membersObjectIds = parsedMembers.map(member =>{
            return new ObjectId(member)
        })
        return membersObjectIds
}

// updates the groupChats document based on the content type provided either is it "path" for images or "content"/ normal message
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

// deletes the specific message based on the collection name
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
        return true
    } catch (error) {
        return false
    }
}