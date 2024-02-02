import axios from "axios";
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