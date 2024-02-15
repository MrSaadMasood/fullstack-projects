import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { regexCheck } from "../functions/passwordRegex";
import server from "../api/axios";

export default function SignUpForm() {
    const [formData, setFormData] = useState({});
    const [checked, setChecked] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const width = isFailed ? "w-[23rem] h-auto" : "w-0 h-0";
    const navigate = useNavigate();

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
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    function handleChecked() {
        setChecked(!checked);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const result = regexCheck(formData.password);

        if (result) {
            server.post("/auth-user/sign-up", { ...formData }).then((res) => {
                setFormData({});
                navigate("/login");
            }).catch((error) => {
                setErrorMessage("Could not sign you up, try again!");
                setIsFailed(true);
            });
        } else {
            setErrorMessage(
                "You must include One Small, One Capital, One Special Character, no Spaces (8-24)"
            );
            setIsFailed(true);
        }
    }

    return (
        <form className="form-wrap" onSubmit={handleSubmit}>
            <div className="form-group text-white">
                <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    className="p-2 h-12 w-[23rem]"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="fullName">Full Name</label>
            </div>
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
            <input
                type="submit"
                value="Sign Up"
                className="bg-[#4E9F3D] h-10 p-2 rounded-md hover:bg-[#5ab747] cursor-pointer"
            />
            {isFailed && (
                <>
                    <div className={`mt-3 ${width} bg-red-600 rounded-xl text-white text-center fade`}>{errorMessage}</div>
                </>
            )}
        </form>
    );
}
