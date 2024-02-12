import { useEffect, useState } from "react"
import useInterceptor from "./hooks/useInterceptors"

export default function RightSideBox({ data }){
    const [ url, setUrl ] = useState("")
    const axiosPrivate = useInterceptor()
    const dateObject = new Date(data.time)

    useEffect(()=>{
        async function getChatImage(image){
            try {
                const response = await axiosPrivate.get(`/user/get-chat-image/${image}`, { responseType : "blob"})
                const imagerUrl = URL.createObjectURL(response.data)
                setUrl(imagerUrl)
            } catch (error) {
                return "/pattern.jpg"
            }
    }

    if(data.path){
        getChatImage(data.path)
    }

    return ()=>{
        URL.revokeObjectURL(url)
    }
    }, [data, axiosPrivate])

    return(
    <div className=" text-white text-base w-[100%] h-auto mb-2 
    flex justify-end items-center">
        <div className="  w-[60%] mr-3 h-auto flex flex-col justify-betweeen items-end">
            <div className=" text-[.5rem] h-4 w-auto flex justify-around items-center">
                <p className="">
                    {dateObject.toDateString()}
                </p>
            </div>
            {data.content &&
                <p className=" pt-1 pb-1 pl-2 pr-2  bg-orange-600 h-auto w-auto break-all 
                    right-box flex justify-center items-center" >
                    {data.content}
                </p>
            }
            {data.path &&  
                <div>
                    <img src={url} alt="img" width={"300px"}  />
                </div>
            }
        </div>
    </div>
    )
}