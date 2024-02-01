import { useContext, useEffect } from "react";
import { isAuth } from "../Context/authContext";
import useLocalStorage from "./useLocalStorage";
import server, { axiosCustom } from "../api/axios";
import axios from "axios";

export default function useInterceptor(){
    const user = useContext(isAuth)
    const { setItem } = useLocalStorage()

    useEffect(()=>{
        const requestInterceptor = axiosCustom.interceptors.request.use(
            config=>{
                if(!config.headers.Authorization){
                    config.headers.Authorization = `Bearer ${user.accessToken}`
                    return config
                }
            },
            error=> Promise.reject(error)
        )

        const responseInterceptor = axiosCustom.interceptors.response.use(
            response=> response,
            error=>{
                const previousRequest = error.config
                if(error.response.status === 401 && !previousRequest.firstTry){
                    previousRequest.firstTry = true
                    console.log("making request to refresh the token");
                    server.post("/auth-user/refresh", { refreshToken : user.refreshToken })
                        .then(res=>{
                            const accessToken = res.data.newAccessToken
                            console.log("getting the acces token", accessToken);
                            setItem("user", { accessToken : accessToken , refreshToken : user.refreshToken })
                            previousRequest.headers.Authorization = `Bearer ${accessToken}`
                            return axiosCustom(previousRequest)
                        })
                }
                return Promise.reject(error)
            }
        )

        return ()=>{
            axiosCustom.interceptors.request.eject(requestInterceptor)
            axiosCustom.interceptors.response.eject(responseInterceptor)
        }
    },[user])

    return axiosCustom
}