const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")
const { body } = require("express-validator")
const stringValidation  = (string)=> body(string).isString().trim().escape()

router.get("/updated-data", userController.getUpdatedData)

router.get("/get-users", userController.getUsersData)

router.post("/send-request", userController.sendFollowRequest)

router.get("/get-friends", userController.getFriends)

router.get("/follow-requests", userController.getFollowRequests)

router.post("/add-friend", userController.addFriend)

router.delete("/remove-friend/:id", userController.removeFriend)

router.delete("/remove-follow-request/:id", userController.removeFollowRequest)

router.get("/get-chat/:id", userController.getChatData )

router.post("/chat-data", stringValidation("content"), userController.updateChatData)

router.get("/get-chatlist", userController.getChatList)

module.exports = router
