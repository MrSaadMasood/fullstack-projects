const express = require("express")
const { ObjectId } = require("mongodb")
const router = express.Router()
const { connectData, getData } = require("../connection")
const fs = require("fs")
const path = require("path")
const {body, validationResult} = require("express-validator")
let database;

connectData(()=>{
    console.log("the coneection to databse is successfull");
    database = getData()
})

// this controller is used to get the image path form the databse form the image id in the url. the path then is used to 
// take the image stored in the server create a stream convert the image into base64 encoding and when the stream
// ends the encoded image is send with the res object
router.get("/:id", async(req, res)=>{
    try {
        const game = await database.collection("games").findOne({ _id : new ObjectId(req.params.id)})
        try {
            const folder = makePath(game.gameImage.path)
            const stream = fs.createReadStream(folder, { encoding : "base64"})
            stream.pipe(res)
            console.log("getting the image from here");
            stream.on("error", (error)=>{
                console.log("error occured while streaming data", error)
                res.status(400)
            })
        } catch (error) {
           console.log("error occured while creating the stream") 
           throw new Error
        }
    } catch (error) {
        console.log("database query failed");
        res.sendStatus(400)   
    }
})

// this controller gets the game object then, 3 random characters from the characters array are taken
// and are put in the for loop each loop creating a stream to encode the image of the character.
// on stream end the encoded image is stored in the object which is sent to the frontend with response
router.get("/:id/characters-data", async(req, res)=>{
    try {
        const game = await database.collection("games").findOne({ _id : new ObjectId(req.params.id)})
            const randomSelectedCharacters = randomCharactersSelector(game.characters)
            let data = [];

            for(let i = 0; i < randomSelectedCharacters.length; i++){
                const filePath = makePath(randomSelectedCharacters[i].imageData.path)
                try {
                    const characterStream = await fs.createReadStream(filePath, {encoding : "base64"})
                    let imageString = ""
                    characterStream.on("data", (chunk)=>{
                        imageString += chunk
                    })
                    characterStream.on("end", ()=>{
                        const characterDataToSend = {}
                        characterDataToSend.name = randomSelectedCharacters[i].name
                        characterDataToSend.id = randomSelectedCharacters[i].id
                        characterDataToSend.image = imageString
                        data.push(characterDataToSend)

                        if(i === 2) return res.json({data})
                    })
                } catch (error) {
                   console.log("stream creating and reading failed"); 
                   res.sendStatus(400)
                }
            }
    } catch (error) {
        console.log("database query failed");
        res.sendStatus(400)
    }
})

// it gets the game character and then finds the character whose coordinates are to be checked and then based on the result
// sends the appropriate response
router.get("/:id/check-location", async(req,res)=>{
    try {
        const { charId , x, y} = req.query
        const game = await database.collection("games").findOne({ _id : new ObjectId(req.params.id)})
        const character = getQueriedCharacter(game.characters, charId)
        const result = checkLocation(character, x , y)
        if(result){
            res.json({ location : character.location})
        }
        else { 
            res.status(400).json({ error : "the location sent was incorrect"})
        }
    } catch (error) {
        console.log("the database search failed")
        res.status(400).json({ error : "the id you entered was incorrect"})  
    }
})

// used to save the records of the user whos completed the game
router.post("/:id/save-record",  body("name").isString().trim().escape(),
                           body("time").isString().trim().escape() ,async(req, res)=>{
    const { name, time } = req.body
    const result = validationResult(req)
    if(result.isEmpty()){
        try {
            const newRecord = await database.collection('records').insertOne({ 
                gameId : new ObjectId(req.params.id) , name : name , time : time
            })
            res.json({ message : "record successfully added"})
        } catch (error) {
           res.status(400).json({ error : "record submission failed"}) 
        }
    }
})

// to get the records of all the users who completed the game
router.get("/:id/get-records", async(req, res)=>{
    try {
        const records = await database.collection("records").find({gameId : new ObjectId(req.params.id)}).toArray()
        res.json({ records : records})
    } catch (error) {
        res.send(400).json({ error : "cannot get the data"})
    }
})
// checks the location of the characters form the object passed. if the character lies within range the result is returned true
function checkLocation(object, x, y){
    const xmin =object.coordinates[0].xmin,
          xmax =object.coordinates[1].xmax,
          ymin =object.coordinates[0].ymin,
          ymax =object.coordinates[1].ymax;
    if(x <= xmax && x >= xmin && y <= ymax && y >= ymin){
        return true
    }
    else return false
}

function getQueriedCharacter(array, id){
    for ( let arr of array){
        if(arr.id === parseInt(id)){
            return arr
        }
    }
}

// to join paths based on the the route obtained from the database
function makePath(adress){
    return path.join(__dirname, `../${adress}`)
}
// tos select 3 random character object from the arrray givem
function randomCharactersSelector(array){
    let selectedCharacters = [];
    let randomNumbers = [];
    const arrayLength = array.length
    for(let i = 0; selectedCharacters.length !== 3; i++){
        const random = Math.floor(Math.random() * arrayLength)
        if(!randomNumbers.includes(random)){
            selectedCharacters.push(array[random])
            randomNumbers.push(random)
        }
    }
    return selectedCharacters
}
module.exports = router