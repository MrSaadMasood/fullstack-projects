import { useContext } from "react";
import Home from "./Home";
import Login from "./Login";
import { isAuth } from "./Context/authContext";

export default function PrivateRoute(){
    const { isAuthenticated } = useContext(isAuth)

    return (
        <div>
            {
                isAuthenticated ? (<Home />) : (<Login />)
            }
        </div>
    )
}