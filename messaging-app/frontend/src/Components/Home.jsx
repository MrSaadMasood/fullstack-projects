import SideBar from "./SideBar"
import { useEffect, useState } from "react"
import { FaList } from "react-icons/fa";
import Messages from "./Messages";
import Chat from "./Chat";
import FriendRequests from "./FriendRequests";
import Users from "./Users";
import Friends from "./Friends";
import useInterceptor from "./hooks/useInterceptors";
import { useLocation } from "react-router-dom";

export default function Home(){
    const { state }= useLocation()
    const [ optionsSelected, setOptionsSelected] = useState(1)
    const [ headerText , setHeaderText]= useState("Chats")
    const [ selectedChat, setSelectedChat ] = useState(null)
    const [dataArray, setDataArray ] = useState([])
    const [ userData , setUserData] = useState(null)
    const axiosPrivate = useInterceptor()
    const display = selectedChat ? "hidden" : ""

    function selectedChatSetter(chat){
        setSelectedChat(chat)
    }

    function selectedOptionSetter(option, text){
        setOptionsSelected(option)
        setHeaderText(text)
    }
    useEffect(()=>{
        console.log(optionsSelected === 5)
        if(optionsSelected === 5){
            axiosPrivate.get("/user/get-users").then(res=>{
                setDataArray(res.data.users)
            }).catch(error=>{
                console.log("cannot get the users", error)
                setDataArray([])
            })
        }
    },[optionsSelected])

    useEffect(()=>{
        if(state){
            setUserData(state.userData)
        }
    }, [state])

    function addToSentRequests(id){
        setUserData((prevData)=>{
            prevData.sentRequests.push(id)
            return { ...prevData }
        })
    }
    return (
        <div className=" lg:flex ">
            <SideBar setOptions={selectedOptionSetter} />
            <div className={`${display} lg:inline h-screen w-full lg:ml-16 lg:w-[23rem]  bg-black lg:border-r-2
             lg:border-[#555555] text-white`}>
                <div className=" border-b-2 border-[#555555] h-24 lg:h-20 flex justify-start items-center">
                        <div className=" flex justify-around items-center h-auto w-auto ml-5">
                            <FaList size={18} />
                            <p className=" font-bold text-xl ml-3">
                               {headerText} 
                            </p> 
                        </div>
                </div>
                <div className=" bg-[#1b1b1b] w-full h-[87vh] overflow-y-scroll noScroll">
                    {dataArray.map( data=>{
                        if(optionsSelected === 1){
                            return <Messages data={ data} selectedChatSetter={selectedChatSetter} type={1} selectedChat={selectedChat} />
                        }
                        if(optionsSelected === 2){
                            return <Friends data={ data} selectedChatSetter={selectedChatSetter}
                             selectedOptionSetter={selectedOptionSetter} />
                        }
                        if(optionsSelected === 3){
                            return <FriendRequests data={ data} />
                        }
                        if(optionsSelected === 4){
                            return <Messages data={ data} selectedChatSetter={selectedChatSetter} type={2} />
                        }
                        if(optionsSelected === 5 ){
                            if(userData._id !== data._id){
                                return <Users data={ data} userData={userData} addToSentRequests={addToSentRequests} />
                            }
                        }
                    })}
                </div>
            </div>
            {selectedChat && <Chat selectedChatSetter={selectedChatSetter} />}
            {!selectedChat &&
                <div className=" hidden bg-black h-screen w-full lg:flex justify-center items-center text-white text-2xl">
                    <p>
                        No Chat Selected
                    </p>
                </div>
            }
            {/* <Profile /> */}
        </div>
    )
}