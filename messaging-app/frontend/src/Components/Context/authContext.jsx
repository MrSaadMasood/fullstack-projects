import { createContext, useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
const isAuth = createContext(null)

const AuthProvider =({ children })=>{
    const [ isAuthenticated ,setIsAuthenticated ] = useState(null)
    const { getItem} = useLocalStorage()
    useEffect(()=>{
        const user = getItem("user")
        console.log("the user obtained from the local storage is", user);
        if(user) setIsAuthenticated(user)
    },[])

    return (
        <isAuth.Provider value={isAuthenticated} >
            {children}
        </isAuth.Provider>
    )
}

export { AuthProvider, isAuth}