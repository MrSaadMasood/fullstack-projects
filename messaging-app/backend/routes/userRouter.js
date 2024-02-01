const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")
router.get("/get-users", userController.getUserData)

module.exports = router
