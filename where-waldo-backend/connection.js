const { MongoClient } = require("mongodb");
require("dotenv").config()
let database;
const url = process.env.MONGO_URL
module.exports = {
    connectData : (callback)=>{
        MongoClient.connect(url).then(connection=>{
            console.log("connection to database successfull")
            database = connection.db("waldo")
            return callback()
        }).catch(error=> callback(error))
    },
    getData : ()=> database
}