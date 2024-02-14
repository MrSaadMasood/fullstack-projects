import { useEffect, useRef, useState } from "react"
import ChatHeader from "./ChatHeader"
import ErrorBox from "./ErrorBox"
import ChatForm from "./Forms/ChatForm"
import LeftSideBox from "./LeftSideBox"
import RightSideBox from "./RightSideBox"
import useInterceptor from "./hooks/useInterceptors"

export default function GroupChat({
    data,
    selectedChatSetter,
    groupData,
    groupImage,
    userData,
    chatDataSetter,
    sendMessageToWS
}){
    const chatDiv = useRef(null)
    console.log("the data is ", data);
    const axiosPrivate = useInterceptor()
    // const [ isScrolled, setIsScrolled] = useState(false)
    // const [ arrayChanged, setArrayChanged] = useState(false)
    const [ input , setInput ] = useState("")

    useEffect(()=>{
        const div = chatDiv.current
        function scrollToBottom(){
            div.scrollTop = div.scrollHeight
        }
        
        scrollToBottom()

    },[data])
    
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
        console.log('triggerd')
        setInput(e.target.value)
    }
    async function handleSubmit(e){
        e.preventDefault()
        try {
            const response = await axiosPrivate.post("/user/group-data", { groupId : groupData._id, content : input })
            console.log("the respoinse is ", response.data)
            sendMessageToWS(groupData ,input, response.data.id, "group")
            setInput("")
        } catch (error) {
           console.log("error occured while sending the message", error) 
        }
    }


    async function handleFileChange(e){
        const image = e.target.files[0]
        if(image.size > 500000){
            const data = { senderName : "Saad", 
                            chat : {
                                content : "Image should be less than 500kb",
                                userId : userData._id, 
                                time : new Date(), 
                                error : true
                            }
         } 
            return chatDataSetter(data, "group")
        }
        try {
            const response = await axiosPrivate.post("/user/add-group-chat-image", {groupId : groupData._id,  image }, {
                headers : {
                    "Content-Type" : "multipart/form-data"
                }
            })
            const { filename, id } = response.data
            console.log("the response after sending the image is", response.data)
            sendMessageToWS(groupData, filename, id, "group", "path" )
        } catch (error) {
            console.log("error occured while sending the image to the server", error)
        }
    }
    return (
        <div className=" lg:w-full">
            <ChatHeader selectedChatSetter={selectedChatSetter} friendData={groupData} friendChatImage={groupImage}/>
            
            <div ref={chatDiv} className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative
             bg-black w-full lg:w-full overflow-y-scroll noScroll ">
                {data.map((chatData, index)=>{
                    
                        if(chatData.chat.error && chatData.chat.userId === userData._id){
                            return <ErrorBox key={index} data={chatData.chat} />
                        }
                        if(chatData.chat.userId === userData._id){
                            return <RightSideBox key={index} data={chatData.chat}
                            chatType="group" sender={chatData.senderName} />
                        }
                        else{
                            return <LeftSideBox
                            chatType="group" key={index} data={chatData.chat} sender={chatData.senderName} />
                        }
                })}
            </div>
            <div >
                <ChatForm handleFileChange={handleFileChange} handleSubmit={handleSubmit} onChange={onChange} />                
            </div>
        </div>
    )
}