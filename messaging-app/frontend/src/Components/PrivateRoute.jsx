import { useContext } from "react";
import Home from "./Home";
import Login from "./Login";
import { isAuth } from "./Context/authContext";

export default function PrivateRoute(){
    const user = useContext(isAuth)

    return (
        <div>
            {
                user ? (<Home />) : (<Login />)
            }
        </div>
    )
}