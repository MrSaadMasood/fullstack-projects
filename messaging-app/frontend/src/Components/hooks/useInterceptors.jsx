import { useContext, useEffect } from "react";
import { isAuth } from "../Context/authContext";
import useLocalStorage from "./useLocalStorage";
import server, { axiosCustom } from "../api/axios";

export default function useInterceptor(){
    const { isAuthenticated}= useContext(isAuth)
    const { setItem } = useLocalStorage()

    useEffect(()=>{
        const requestInterceptor = axiosCustom.interceptors.request.use(
            config=>{
                if(!config.headers.Authorization){
                    config.headers.Authorization = `Bearer ${isAuthenticated.accessToken}`
                }

                return config
            },
            error=> Promise.reject(error)
        )

        const responseInterceptor = axiosCustom.interceptors.response.use(
            response=> response,
            async (error)=>{
                const previousRequest = error.config
                if(error.response.status === 401 && !previousRequest.firstTry){
                    previousRequest.firstTry = true
                    try {
                        const response = await server.post("/auth-user/refresh", { refreshToken :isAuthenticated.refreshToken})
                        const accessToken = response.data.newAccessToken
                        console.log("the response obtained is", accessToken)
                        previousRequest.headers.Authorization = `Bearer ${accessToken}`
                        setItem("user", { accessToken, refreshToken :isAuthenticated.refreshToken })
                        return axiosCustom(previousRequest)
                    } catch (error) {
                       console.log("the error occured while refreshing the token", error) 
                    }
                }
                return Promise.reject(error)
            }
        )

        return ()=>{
            axiosCustom.interceptors.request.eject(requestInterceptor)
            axiosCustom.interceptors.response.eject(responseInterceptor)
        }
    },[isAuthenticated])

    return axiosCustom
}