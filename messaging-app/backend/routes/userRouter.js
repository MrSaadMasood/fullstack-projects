const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")

router.get("/updated-data", userController.getUpdatedData)

router.get("/get-users", userController.getUsersData)

router.post("/send-request", userController.sendFollowRequest)

router.get("/get-friends", userController.getFriends)

router.get("/follow-requests", userController.getFollowRequests)

router.post("/add-friend", userController.addFriend)

module.exports = router
