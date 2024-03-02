import { useContext } from "react";
import Login from "./Login";
import { Outlet } from "react-router-dom";
import { isAuth } from "./Context/authContext";

export default function PrivateRoute(){
    const { isAuthenticated } = useContext(isAuth)

    return (
        <div>
            {
                isAuthenticated ? (<Outlet />) : (<Login />)
            }
        </div>
    )
}