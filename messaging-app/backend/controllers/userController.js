const { connectData , getData} = require("../connection")

let database;

connectData((err)=>{
    if(!err) database = getData()
})

exports.getUserData = async(req, res)=>{
    res.json({ message : "the data is successfully received"})
}