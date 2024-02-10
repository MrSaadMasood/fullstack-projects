import { IoMdSend } from "react-icons/io";
import { AiFillPicture } from "react-icons/ai";

import ChatHeader from "./ChatHeader";
import LeftSideBox from "./LeftSideBox";
import RightSideBox from "./RightSideBox";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"
import useInterceptor from "./hooks/useInterceptors";
import ErrorBox from "./ErrorBox";

export default function Chat({ selectedChatSetter, chatData, friendData, userData, sendMessageToWS, chatDataSetter}){
    const fileInputRef = useRef()
    const chatDiv = useRef()
    const axiosPrivate = useInterceptor()
    // const [ isScrolled, setIsScrolled] = useState(false)
    // const [ arrayChanged, setArrayChanged] = useState(false)
    const [ input , setInput ] = useState("")
    const [ errorDiv , setErrorDiv] = useState(null)
    const realChat = chatData?.chat

    useEffect(()=>{
        const div = chatDiv.current
        function scrollToBottom(){
            div.scrollTop = div.scrollHeight
        }
        
        scrollToBottom()

    },[chatData])

    useEffect(()=>{
        if(errorDiv){
            const timer = setTimeout(() => {
                setErrorDiv(null)
            }, 2000);

            return ()=>clearTimeout(timer)
        }
    },[errorDiv])
    
    // useEffect(()=>{

    // const div = chatDiv.current
    //     div.addEventListener("scroll", ()=>{
    //         console.log(div.scrollTop + div.clientHeight === div.scrollHeight )
    //         if(div.scrollTop + div.clientHeight === div.scrollHeight ){
    //             setIsScrolled(false)
    //         }
    //         else if( div.scrollTop + div.clientHeight !== div.scrollHeighth && arrayChanged){
    //             console.log("inside the else if statement");
    //             setIsScrolled(false)
    //             setArrayChanged(false)
    //         }
    //         else{
    //             setIsScrolled(true)
    //         }
    //     })
    // })

    function onChange(e){
        setInput(e.target.value)
    }
    async function handleSubmit(e){
        e.preventDefault()
        try {
            const response = await axiosPrivate.post("/user/chat-data", { friendId : friendData._id, content : input })
            sendMessageToWS( friendData ,input, response.data.id)
            setInput("")
        } catch (error) {
           console.log("error occured while sending the message", error) 
        }
    }
    function triggerFileInput(){
        fileInputRef.current.click()
    }
    function handleFileChange(e){
        console.log(e.target.files[0])
        const image = e.target.files[0]

        if(image.size > 500000){
            setErrorDiv("Image must be less than 500kb")
            chatDataSetter({content : "Image should be less than 500kb", userId : userData._id, time : new Date(), error : true})
            return
        }

    }
    return (
        <div className=" lg:w-full">
            <ChatHeader selectedChatSetter={selectedChatSetter} friendData={friendData} />
            
            <div ref={chatDiv} className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative
             bg-black w-full lg:w-full overflow-y-scroll noScroll ">
                {realChat?.map((chat)=>{
                    
                        if(chat.error && chat.userId === userData._id){
                            console.log("inside heren");
                            return <ErrorBox data={chat} />
                        }
                        if(chat.userId === userData._id){
                            return <RightSideBox data={chat} />
                        }
                        else{
                            return <LeftSideBox data={chat} />
                        }
                })}
            </div>
            <div >

                <form className=" lg:bg-black h-12 w-full flex justify-center items-center 
                fixed bottom-14 sm:bottom-16 md:bottom-[4.5rem] lg:static " onSubmit={handleSubmit} >
                    <div className="w-10" ></div>
                    <input type="file" name="image" id="image" className=" hidden" accept=".jpg" ref={fileInputRef}
                    onChange={handleFileChange} />
                    <input type="text" name="content" id="content" placeholder="Type a message"
                    className=" p-1 md:p-1 bg-black text-white text-sm h-auto w-full rounded-lg border-2 border-gray-600"
                    onChange={onChange} />
                    <button type="submit" className=" flex justify-center items-center w-10 ml-1">
                        <IoMdSend size={23} color="white" />
                    </button>
                    <button type="button" onClick={triggerFileInput} className=" flex justify-center items-center w-10 mr-1">
                        <AiFillPicture size={23} color="white" />
                    </button>
                </form>
            </div>
        </div>
    )
}