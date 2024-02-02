const { MongoClient } = require("mongodb");
require("dotenv").config()
let database;
module.exports = {
    connectData : (callback)=>{
        MongoClient.connect(process.env.MONGO_URL).then(connection=>{
             database= connection.db("chat-app")
             console.log("the databse connection is successfull")
            return callback()
        }).catch(error =>{
            return callback(error)
        })
    },

    getData : ()=> database
}