import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import server from "../api/axios";
import { isAuth } from "../Context/authContext";

export default function LoginForm() {
    const [formData, setformData] = useState({});
    const [checked, setChecked] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const { setIsAuthenticated } = useContext(isAuth);
    const width = isFailed ? "w-[23rem] h-auto" : "w-0 h-0";
    const navigate = useNavigate();
    const { setItem } = useLocalStorage();

    useEffect(() => {
        if (isFailed) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
                setIsFailed(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isFailed]);

    function handleChange(e) {
        const { name, value } = e.target;
        setformData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    function handleChecked() {
        setChecked(!checked);
    }

    function handleSubmit(e) {
        e.preventDefault();
        server.post("/auth-user/login", { ...formData }).then((res) => {
            setformData({});
            setIsAuthenticated({
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
            });
            setItem("user", {
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
            });
            navigate("/", { state: { userData: res.data.userData }, replace: true });
        }).catch(() => {
            setErrorMessage("Could not log you in, try again!");
            setIsFailed(true);
        });
    }

    return (
        <form className="form-wrap" onSubmit={handleSubmit}>
            <div className="form-group text-white">
                <input
                    type="email"
                    name="email"
                    id="email"
                    className="p-2 h-12 w-[23rem]"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="email">Email</label>
            </div>
            <div className="form-group text-white">
                <input
                    type={checked ? "text" : "password"}
                    name="password"
                    id="password"
                    className="p-2 h-12 w-[23rem]"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="password">Password</label>
            </div>
            <div className="flex justify-start items-center mb-2">
                <label htmlFor="showPassword" className="text-[#999999]">Show Password</label>
                <input
                    type="checkbox"
                    name="showPassword"
                    id="showPassword"
                    className="ml-2"
                    checked={checked}
                    onChange={handleChecked}
                />
            </div>
            <div className="flex justify-between items-center">
                <input
                    type="submit"
                    value="Log in"
                    className="bg-[#4E9F3D] h-10 p-2 rounded-md hover:bg-[#5ab747] cursor-pointer"
                />
                <Link to={"/sign-up"} className="text-sm text-[#999999] hover:text-[#c8c8c8]">Sign up</Link>
            </div>
            {isFailed && (
                <>
                    <div className={`mt-3 ${width} bg-red-600 rounded-xl text-white text-center fade`}>
                        {errorMessage}
                    </div>
                </>
            )}
        </form>
    );
}
