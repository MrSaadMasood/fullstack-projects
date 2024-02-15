
import ChatHeader from "./ChatHeader";
import LeftSideBox from "./LeftSideBox";
import RightSideBox from "./RightSideBox";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"
import useInterceptor from "./hooks/useInterceptors";
import ErrorBox from "./ErrorBox";
import ChatForm from "./Forms/ChatForm";

export default function Chat({ selectedChatSetter, chatData, friendData, userData, sendMessageToWS, chatDataSetter,
    handleMessageDelete,
    friendChatImage}){
    const fileInputRef = useRef()
    const chatDiv = useRef()
    const axiosPrivate = useInterceptor()
    // const [ isScrolled, setIsScrolled] = useState(false)
    // const [ arrayChanged, setArrayChanged] = useState(false)
    const [ input , setInput ] = useState("")
    const realChat = chatData?.chat

    useEffect(()=>{
        const div = chatDiv.current
        function scrollToBottom(){
            div.scrollTop = div.scrollHeight
        }
        
        scrollToBottom()

    },[chatData])
    
    function onChange(e){
        setInput(e.target.value)
    }
    async function handleSubmit(e){
        e.preventDefault()
        try {
            const response = await axiosPrivate.post("/user/chat-data", { friendId : friendData._id, content : input })
            sendMessageToWS( friendData ,input, response.data.id)
            e.target.reset()
        } catch (error) {
           console.log("error occured while sending the message", error) 
        }
    }


    async function handleFileChange(e){
        const image = e.target.files[0]
        if(image.size > 500000){
            return chatDataSetter({content : "Image should be less than 500kb", userId : userData._id, time : new Date(), error : true})
        }
        try {
            const response = await axiosPrivate.post("/user/add-chat-image", {friendId : friendData._id,  image }, {
                headers : {
                    "Content-Type" : "multipart/form-data"
                }
            })
            const { filename, id } = response.data
            sendMessageToWS(friendData, filename, id, "normal","path" )
        } catch (error) {
            console.log("error occured while sending the image to the server", error)
        }
    }
    function deleteMessage(id){
        handleMessageDelete(id, "normal")
    }
    return (
        <div className=" lg:w-full">
            <ChatHeader selectedChatSetter={selectedChatSetter} friendData={friendData} friendChatImage={friendChatImage}/>
            
            <div ref={chatDiv} className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative
             bg-black w-full lg:w-full overflow-y-scroll noScroll ">
                {realChat?.map((chat, index)=>{
                    
                        if(chat.error && chat.userId === userData._id){
                            return <ErrorBox key={index} data={chat} />
                        }
                        if(chat.userId === userData._id){
                            return <RightSideBox key={index} data={chat} deleteMessage={deleteMessage} />
                        }
                        else{
                            return <LeftSideBox key={index} data={chat} />
                        }
                })}
            </div>
            <div >
                <ChatForm handleFileChange={handleFileChange} handleSubmit={handleSubmit} onChange={onChange} />                
            </div>
        </div>
    )
}