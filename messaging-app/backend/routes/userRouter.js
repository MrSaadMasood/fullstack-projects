const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination : (req, file, callback)=>{
        let absolutePath;

        if(req.chatImage){
            absolutePath = path.join(__dirname, "../uploads/chat-images")
        }
        if(req.profileImage){
            absolutePath = path.join(__dirname, "../uploads/profile-images")
        }
        if(req.groupImage){
            absolutePath = path.join(__dirname , "../uploads/group-images")
        }
        callback(null, absolutePath)
    },
    filename : (req, file, callback)=>{
        const suffix = `${Date.now()}${Math.round(Math.random()* 1E9)}.jpg`
        console.log("the file inside the filename is", file)
        callback(null, file.fieldname + "-" + suffix)

    }
})

const upload = multer({ storage : storage })

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

router.post("/add-chat-image",(req, _, next)=>{ req.chatImage = true ; next()}, upload.single("image"), userController.saveChatImagePath)

router.post("/add-profile-image", (req,_,next)=>{ req.profileImage = true; next()} , upload.single("image"), userController.saveProfilePicturePath)

router.get("/get-chat-image/:name", userController.getChatImage )

router.get("/get-profile-picture/:name", userController.getProfilePicture )

router.post("/change-bio", stringValidation("bio"), userController.changeBio)

router.get("/get-friends-data", userController.getFriendsData)

router.post("/create-new-group", (req,_,next)=>{ req.groupImage = true; next()}, upload.single("image") , userController.createNewForm)

router.delete("/delete-previous-profile-picture/:name", userController.deletePrevProfilePicture)

module.exports = router
