const { MongoClient, ObjectId } = require("mongodb")
const { getData, connectData } = require("../connection")

const transactionOptions = {
    writeConcern : { w : "majority"},
    maxCommitTimeMs : 1000
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
async function removeFriendTransaction(client, userId, idToRemove){
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

// gets used to get the friends and received requests based on type provided
async function getCustomData (database, userId, type) {

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
       if(!data) throw new Error
       return data
    } catch (error) {
       console.log("cannot get the custom data") 
       return
    }
}

// updates the groupChats document based on the content type provided either is it "path" for images or "content"/ normal message
async function updateGroupChat(database, collectionId, userId, contentType, content){
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
        if(!updated) throw new Error

        return randomId.toString()
    } catch (error) {
        return false
    }
}


// deletes the specific message based on the collection name
async function deleteMessageFromChat(database, collectionId, messageId, collectionName){
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
        if(!deletedMessage) throw new Error
            
        return true
    } catch (error) {
        return false
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

function clientMaker(url){
    return new MongoClient(url)
}

async function dataBaseConnectionMaker(url){
    const client = new MongoClient(url)
    await client.connect()
    const database = client.db("chat-app")
    return database
}

module.exports = { 
    sendingRequestsTransaction,
    addFriendTransaction,
    removeFollowRequestTransaction,
    removeFriendTransaction,
    updateChatMessageTransaction,
    clientMaker,
    groupChatTransaction,
    getCustomData,
    convertStringArrayToObjectIdsArray, 
    updateGroupChat,
    deleteMessageFromChat,
    dataBaseConnectionMaker   
}