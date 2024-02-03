const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")

router.get("/updated-data", userController.getUpdatedData)

router.get("/get-users", userController.getUsersData)

router.post("/send-request", userController.sendFollowRequest)

router.get("/get-friends", userController.getFriends)

router.get("/follow-requests", userController.getFollowRequests)

router.post("/add-friend", userController.addFriend)

router.delete("/remove-friend/:id", userController.removeFriend)

router.delete("/remove-follow-request/:id", userController.removeFollowRequest)

module.exports = router
