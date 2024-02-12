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
import { io } from "socket.io-client";
import Profile from "./Profile";

export default function Home(){
    const { state }= useLocation()
    const [ optionsSelected, setOptionsSelected] = useState(1)
    const [ headerText , setHeaderText]= useState("Chats")
    const [ selectedChat, setSelectedChat ] = useState(null)
    const [dataArray, setDataArray ] = useState([])
    const [ userData , setUserData] = useState(null)
    const [ chatList, setChatList] = useState([])
    const [ isUserChanged, setIsUserChanged] = useState(false)
    const [ chatData, setChatData] = useState({ chat : []})
    const [ friendData, setFriendData] = useState({})
    const [ socket, setSocket] = useState(null)
    const [ joinedRoom, setJoinedRoom] = useState(null)
    const [ profilePictureUrl, setProfilePictureUrl ] = useState("/placeholder.png")
    const axiosPrivate = useInterceptor()
    const display = selectedChat ? "hidden" : ""    
    console.log("the user data ", profilePictureUrl)

    useEffect(()=>{
        
        const socket = io("http://localhost:3000")
        setSocket(socket)

        socket.on("joined-chat", (roomId)=>{
            setJoinedRoom(roomId)
        })

        socket.on("received-message", (data)=>{
            
            chatDataSetter(data)

            chatListArraySetter(data.userId, data)

        })
        return ()=>{
            socket.disconnect()
        }
    },[])
    useEffect(()=>{
        if(optionsSelected === 1){
            axiosPrivate.get("/user/get-chatlist").then(res=>{
                setChatList(res.data.chatList)
            }).catch(error=>{
                console.log("error occured while getting the chat list", error)
                setDataArray([])
            })
        }

        if(optionsSelected === 2){
            axiosPrivate.get("/user/get-friends").then(res=>{
                if(res.status === 200){
                    setDataArray(res.data.friends)
                }
            }).catch(()=>{
                setDataArray([])
            })
        }

        if(optionsSelected === 3){
                axiosPrivate.get("/user/follow-requests").then(res=>{
                    setDataArray(res.data.receivedRequests)
                    
                }).catch((error)=>{
                    console.log("failed while getting the follow requests", error);
                    setDataArray([])
                })
            }

        if(optionsSelected === 5){
            axiosPrivate.get("/user/get-users").then(res=>{
                setDataArray(res.data.users)
            }).catch(error=>{
                console.log("cannot get the users", error)
                setDataArray([])
            })
        }
   
    },[optionsSelected, axiosPrivate])

    useEffect(()=>{

        getUserData()

    },[axiosPrivate])

    useEffect(()=>{
        if(isUserChanged){
            getUserData()
            setIsUserChanged(false)
        }
    },[axiosPrivate, isUserChanged])

    async function getUserData(){
        try {
            const response = await axiosPrivate.get("/user/updated-data")
            const data = response.data.updatedData
            setUserData(data)
            if(data.profilePicture){
                const picture = await axiosPrivate.get(`/user/get-profile-picture/${data.profilePicture}`, { responseType : "blob"})
                const pictureUrl = URL.createObjectURL(picture.data)
                setProfilePictureUrl(pictureUrl)
                return ()=> URL.revokeObjectURL(pictureUrl)
            }
        } catch (error) {
            console.log("failed to get the user data", error)        
        }
    }

    function addToSentRequests(id){
        setUserData((prevData)=>{
            prevData.sentRequests.push(id)
            return { ...prevData }
        })
    }
    
    function removeFollowRequestAndFriend(id){
        setDataArray((prevData)=>{
            const updatedArray = prevData.filter(item=>{
                return item._id !== id
            })
            return updatedArray
        })
    }
    function selectedChatSetter(chat){
        setSelectedChat(chat)
    }

    function selectedOptionSetter(option, text){
        console.log("the options is set to", option)
        setOptionsSelected(option)
        setHeaderText(text)
    }

    function isUserChangedSetter(value){
        setIsUserChanged(value)
    }

    function generateRoomId(userId, friendId){
        const sortedArray = [userId, friendId].sort()
        return `room${sortedArray[0]},${sortedArray[1]}`
    }

    function getChatData(data){
        console.log("the data passed in to get the chat data is", data);

        axiosPrivate.get(`/user/get-chat/${data._id}`, ).then(res=>{
            console.log("the response obtained is", res.data)
            setChatData(res.data.chatData)
        }).catch(error=>{
            console.log("error occured while getting the chat", error)
            setChatData({ chat : []})
        })

        const roomId = generateRoomId(userData._id, data._id)
        socket.emit("join-room", joinedRoom , roomId)

        setFriendData(data)
    }
    
    function chatListArraySetter(id, data){

        setChatList((prevData)=>{
            const modified = prevData.map((item)=>{
                if(item.friendData._id === id){
                    item.lastMessage = data
                }
                return item
            })
            return modified
        })
    }
    function sendMessageToWS(friendData, type = "content", content, contentId){
       
        const data = { 
                [type] : content, 
                id : contentId,
                time : new Date(),
                userId : userData._id}
        
        chatDataSetter(data)
        chatListArraySetter(friendData._id, data)

        socket.emit("send-message", joinedRoom, data )
    }

    function chatDataSetter(data){

        setChatData((prevChatData)=>{
            const newArray = [...prevChatData.chat, data ]
            return {
                ...prevChatData,
                chat : newArray
            }
        })

    }
    return (
        <div>
        <div className=" lg:flex ">
            <SideBar setOptions={selectedOptionSetter}  profilePictureUrl={ profilePictureUrl}/>
            
            {optionsSelected === 6 &&
                <Profile userData={userData}  profilePictureUrl={ profilePictureUrl}  isUserChangedSetter={isUserChangedSetter} />
            } 
            {optionsSelected !== 6 &&
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

                        {optionsSelected === 1 && chatList.map((chat, index)=>{
                            if(optionsSelected === 1){
                                return <Messages data={ chat} selectedChatSetter={selectedChatSetter} type={1} selectedChat={selectedChat}
                                getChatData={getChatData} />
                            }
                        })}
                        {optionsSelected !== 1 && dataArray.map( data=>{
                            if(optionsSelected === 2){
                                return <Friends data={ data} selectedChatSetter={selectedChatSetter}
                                selectedOptionSetter={selectedOptionSetter} isUserChangedSetter={isUserChangedSetter}
                                removeFriendFromDataArray={removeFollowRequestAndFriend} getChatData={getChatData} />
                            }
                            if(optionsSelected === 3){
                                return <FriendRequests data={ data} isUserChangedSetter={isUserChangedSetter}
                                removeFollowRequest={removeFollowRequestAndFriend} />
                            }
                            if(optionsSelected === 4){
                                return <Messages data={ data} selectedChatSetter={selectedChatSetter} type={2} />
                            }
                            if(optionsSelected === 5 ){
                                if(userData._id !== data._id && userData.friends.includes(data._id) === false){
                                    return <Users data={ data} userData={userData} addToSentRequests={addToSentRequests}
                                    isUserChangedSetter={isUserChangedSetter} />
                                }
                            }
                        })}
                    </div>
                </div>
            }
            
            {optionsSelected !== 6 && selectedChat && <Chat selectedChatSetter={selectedChatSetter} chatData={chatData} friendData={friendData}
            userData={userData} sendMessageToWS={sendMessageToWS} chatDataSetter={chatDataSetter} />}
            {optionsSelected !==6 && !selectedChat &&
                <div className=" hidden bg-black h-screen w-full lg:flex justify-center items-center text-white text-2xl">
                    <p>
                        No Chat Selected
                    </p>
                </div>
            }
        </div>
        {/* <div>

            <div className="fixed top-0 left-0 w-[100%] h-[100%] bg-black opacity-60 z-30">
            </div>
                <div className="fixed top-[30%] left-[40%] w-[20rem] h-[20rem] center z-40 bg-red-200">
                    hello
                </div>
        </div> */}
        </div>

    )
}