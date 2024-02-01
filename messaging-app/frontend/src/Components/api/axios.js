import axios from "axios";
import { useContext } from "react";
const user = JSON.parse(localStorage.getItem("user")) 
const server = axios.create({
    baseURL : "http://localhost:3000/",
    headers : { "Content-Type" : "application/json"}
})

const axiosCustom = axios.create({
    baseURL : "http://localhost:3000/",
    headers : { "Content-Type" : "application/json"} 
})
export { axiosCustom }

export default server