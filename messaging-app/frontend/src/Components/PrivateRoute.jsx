import { useContext } from "react";
import Login from "./Login";
import { isAuth } from "./Context/authContext";
import { Outlet } from "react-router-dom";

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