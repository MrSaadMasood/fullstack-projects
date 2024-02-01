const express = require("express")
const router = express.Router()
const sessionController = require("../controllers/sessionController.js")
const { body } = require("express-validator")
const stringValidation  = (string)=> body(string).isString().trim().escape()

router.post(
    "/sign-up", 
    stringValidation("fullName"), 
    stringValidation("email"),
    stringValidation("password"),
    sessionController.createUser)
                         
router.post("/login", stringValidation("email"), stringValidation("password"), sessionController.loginUser)

router.post("/refresh", sessionController.refreshUser)

router.delete("/logout", sessionController.logoutUser)

module.exports = router