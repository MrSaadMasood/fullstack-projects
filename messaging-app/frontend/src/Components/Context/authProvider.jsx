import { useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import PropTypes from "prop-types"
import { isAuth } from "./authContext";
// passing the initial values for the context and when the user logs in isAuthenticated is an object with two properties
// accessToken and RefreshToken and then these values are passed to the children and the tokens are stored in the localstorage
// which are accessed when the user visits the site again thus persisting the user login
const AuthProvider = ({ children })=>{
    const [ isAuthenticated ,setIsAuthenticated ] = useState(null)
    const { getItem} = useLocalStorage()
    useEffect(()=>{
        const user = getItem("user")
        if(user) setIsAuthenticated(user)
    },[])

    return (
        <isAuth.Provider value={{isAuthenticated, setIsAuthenticated}} >
            {children}
        </isAuth.Provider>
    )
}

export { AuthProvider}

AuthProvider.propTypes = {
    children : PropTypes.element.isRequired
}