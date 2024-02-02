import { IoMdSend } from "react-icons/io";
import ChatHeader from "./ChatHeader";
import LeftSideBox from "./LeftSideBox";
import RightSideBox from "./RightSideBox";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"

export default function Chat({ selectedChatSetter}){
    const chatDiv = useRef()
    // const [ isScrolled, setIsScrolled] = useState(false)
    // const [ arrayChanged, setArrayChanged] = useState(false)
    const [ a ,seta] = useState([1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,55])

    useEffect(()=>{
        const div = chatDiv.current
        function scrollToBottom(){
            div.scrollTop = div.scrollHeight
        }
        
        scrollToBottom()

    },[a])
    
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

    function handleSubmit(e){
        e.preventDefault()
        const value = e.target.content.value
        seta((prev)=>{
            const up = [...prev]
            up.push(value)
            return up
        })
    }
    return (
        <div className=" lg:w-full">
            <ChatHeader selectedChatSetter={selectedChatSetter} />
            <div ref={chatDiv} className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative bg-black w-full lg:w-full overflow-y-scroll noScroll ">
                {a.map((item, index)=>{
                        if(index % 2 !== 0){
                            return <LeftSideBox />
                        }
                        else{
                            return <RightSideBox />
                        }
                })}
            </div>
            <div >
                <form className=" lg:bg-black h-12 w-full flex justify-center items-center 
                fixed bottom-14 sm:bottom-16 md:bottom-[4.5rem] lg:static " onSubmit={handleSubmit} >
                    <div className="w-10" ></div>
                    <input type="text" name="content" id="content" placeholder="Type a message"
                    className=" p-1 md:p-1 bg-black text-white text-sm h-auto w-full rounded-lg border-2 border-gray-600" />
                    <button type="submit" className=" flex justify-center items-center w-10 ml-1">
                        <IoMdSend size={23} color="white" />
                    </button>
                </form>
            </div>
        </div>
    )
}