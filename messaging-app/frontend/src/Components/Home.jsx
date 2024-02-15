import { CiCirclePlus } from "react-icons/ci";
import SideBar from "./SideBar";
import { useEffect, useState } from "react";
import { FaList } from "react-icons/fa";
import Messages from "./Messages";
import Chat from "./Chat";
import FriendRequests from "./FriendRequests";
import Users from "./Users";
import Friends from "./Friends";
import useInterceptor from "./hooks/useInterceptors";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Profile from "./Profile";
import GroupMessagesList from "./GroupMessagesList";
import GroupChat from "./GroupChat";
import DeleteMessage from "./DeleteMessage";

export default function Home() {
    const [optionsSelected, setOptionsSelected] = useState(1);
    const [headerText, setHeaderText] = useState("Chats");
    const [selectedChat, setSelectedChat] = useState(null);
    const [dataArray, setDataArray] = useState([]);
    const [userData, setUserData] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [isUserChanged, setIsUserChanged] = useState(false);
    const [chatData, setChatData] = useState({ chat: [] });
    const [groupChatData, setGroupChatData] = useState([]);
    const [friendData, setFriendData] = useState({});
    const [socket, setSocket] = useState(null);
    const [joinedRoom, setJoinedRoom] = useState(null);
    const [groupData, setGroupData] = useState({});
    const [profilePictureUrl, setProfilePictureUrl] = useState("/placeholder.png");
    const [friendChatImage, setFriendChatImage] = useState("/placeholder.png");
    const [messageToDeleteInfo, setMessageToDeleteInfo] = useState({});
    const [showDeleteMessageOptions, setShowDeletMessageOption] = useState(false);
    const axiosPrivate = useInterceptor();
    const display = selectedChat ? "hidden" : "";

    useEffect(() => {
        const socket = io("http://localhost:3000");
        setSocket(socket);

        socket.on("joined-chat", (roomId) => {
            setJoinedRoom(roomId);
        });

        socket.on("received-message", (data, chatType, groupChatData) => {

            if (chatType === "normal") {
                chatDataSetter(data, chatType);
                chatListArraySetter(data.userId, data, chatType);
            }

            if (chatType === "group") {
                chatDataSetter(groupChatData, chatType);
                chatListArraySetter(data._id, data, chatType);
            }
        });

        socket.on("delete-message", (id, type) => {
            removeDeletedMessageFromChat(id, type);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (optionsSelected === 1) {
            axiosPrivate.get("/user/get-chatlist").then((res) => {
                setChatList(res.data.chatList);
            }).catch((error) => {
                console.log("error occured while getting the chat list", error);
                setDataArray([]);
            });
        }

        if (optionsSelected === 2) {
            axiosPrivate.get("/user/get-friends").then((res) => {
                if (res.status === 200) {
                    setDataArray(res.data.friends);
                }
            }).catch(() => {
                setDataArray([]);
            });
        }

        if (optionsSelected === 3) {
            axiosPrivate.get("/user/follow-requests").then((res) => {
                setDataArray(res.data.receivedRequests);
            }).catch((error) => {
                console.log("failed while getting the follow requests", error);
                setDataArray([]);
            });
        }

        if (optionsSelected === 4) {
            axiosPrivate.get("/user/group-chats").then((res) => {
                setDataArray(res.data.groupChats);
            }).catch((error) => {
                console.log("failed to get the group chats ", error);
                setDataArray([]);
            });
        }

        if (optionsSelected === 5) {
            axiosPrivate.get("/user/get-users").then((res) => {
                setDataArray(res.data.users);
            }).catch((error) => {
                console.log("cannot get the users", error);
                setDataArray([]);
            });
        }
    }, [optionsSelected, axiosPrivate]);

    useEffect(() => {
        getUserData();
    }, [axiosPrivate]);

    useEffect(() => {
        if (isUserChanged) {
            getUserData();
            setIsUserChanged(false);
        }
    }, [axiosPrivate, isUserChanged]);

    async function getUserData() {
        try {
            const response = await axiosPrivate.get("/user/updated-data");
            const data = response.data.updatedData;
            setUserData(data);

            if (data.profilePicture) {
                const picture = await axiosPrivate.get(`/user/get-profile-picture/${data.profilePicture}`, { responseType: "blob" });
                const pictureUrl = URL.createObjectURL(picture.data);
                setProfilePictureUrl(pictureUrl);
                return () => URL.revokeObjectURL(pictureUrl);
            }
        } catch (error) {
            console.log("failed to get the user data", error);
        }
    }

    function addToSentRequests(id) {
        setUserData((prevData) => {
            prevData.sentRequests.push(id);
            return { ...prevData };
        });
    }

    function removeFollowRequestAndFriend(id) {
        setDataArray((prevData) => {
            const updatedArray = prevData.filter(item => {
                return item._id !== id;
            });
            return updatedArray;
        });
    }

    function selectedChatSetter(chat) {
        setSelectedChat(chat);
    }

    function selectedOptionSetter(option, text) {
        setOptionsSelected(option);
        setHeaderText(text);
    }

    function isUserChangedSetter(value) {
        setIsUserChanged(value);
    }

    function generateRoomId(userId, friendId) {
        const sortedArray = [userId, friendId].sort();
        return `room${sortedArray[0]},${sortedArray[1]}`;
    }
    function getChatData(data, type) {
        if (type === "normal") {
            axiosPrivate.get(`/user/get-chat/${data._id}`).then(res => {
                setChatData(res.data.chatData);
            }).catch(error => {
                console.log("error occurred while getting the chat", error);
                setChatData({ chat: [] });
            });
    
            const roomId = generateRoomId(userData._id, data._id);
            socket.emit("join-room", joinedRoom, roomId);
    
            setFriendData(data);
        }
    
        if (type === "group") {
            axiosPrivate.get(`/user/get-group-chat/${data._id}`).then(res => {
                setGroupChatData(res.data.groupChatData);
            }).catch(error => {
                console.log("error occurred while getting the group chat data", error);
                setGroupChatData([]);
            });
    
            const roomId = generateRoomId(data._id, data.groupName);
            socket.emit("join-room", joinedRoom, roomId);
    
            setGroupData(data);
        }
    }
    
    function chatListArraySetter(id, data, chatType = "normal") {
        if (chatType === "normal") {
            setChatList((prevData) => {
                const modified = prevData.map((item) => {
                    if (item.friendData._id === id) {
                        item.lastMessage = data;
                    }
                    return item;
                });
                return modified;
            });
        }
    
        if (chatType === "group") {
            setDataArray((prevData) => {
                const modified = prevData.map(item => {
                    if (item._id === id) {
                        return data;
                    }
                    return item;
                });
                return modified;
            });
        }
    }
    
    function sendMessageToWS(sentData, content, contentId, chatType = "normal", type = "content") {
        const data = {
            [type]: content,
            id: contentId,
            time: new Date(),
            userId: userData._id
        };
    
        if (chatType === "normal") {
            chatDataSetter(data, chatType);
            chatListArraySetter(sentData._id, data, chatType);
            socket.emit("send-message", joinedRoom, data, chatType, "useless");
        }
    
        if (chatType === "group") {
            const groupChatData = {
                senderName: sentData.senderName,
                chat: data
            };
            chatDataSetter(groupChatData, chatType);
            sentData.lastMessage = data;
            chatListArraySetter(sentData._id, sentData, chatType);
            socket.emit("send-message", joinedRoom, sentData, chatType, groupChatData);
        }
    }
    
    function chatDataSetter(data, type = "normal") {
        if (type === "normal") {
            setChatData((prevChatData) => {
                const newArray = [...prevChatData.chat, data];
                return {
                    ...prevChatData,
                    chat: newArray
                };
            });
        }
        if (type === "group") {
            setGroupChatData((prevData) => {
                const array = [...prevData];
                array.push(data);
                return [
                    ...array
                ];
            });
        }
    }
    
    function chatFriendImageSetter(url) {
        setFriendChatImage(url);
    }
    
    function handleMessageDelete(messageId, type) {
        setMessageToDeleteInfo({
            collectionId: type === "normal" ? chatData._id : groupChatData[0]._id,
            type: type,
            messageId
        });
        setShowDeletMessageOption(true);
    }
    
    function removeDeletedMessageFromChat(messageId, type) {
        if (type === "normal") {
            setChatData((prevData) => {
                const arrayAfterDeletion = prevData.chat.filter(item => {
                    return item.id !== messageId;
                });
                return {
                    ...prevData,
                    chat: [...arrayAfterDeletion]
                };
            });
            socket.emit("delete-message", joinedRoom, messageId, type);
        }
        if (type === "group") {
            setGroupChatData((prevData) => {
                const array = prevData.filter(item => {
                    return item.chat.id !== messageId;
                });
                return array;
            });
            socket.emit("delete-message", joinedRoom, messageId, type);
        }
    }
    
    async function deleteMessage() {
        try {
            await axiosPrivate.delete(`/user/delete-message?data=${JSON.stringify(messageToDeleteInfo)}`);
            removeDeletedMessageFromChat(messageToDeleteInfo.messageId, messageToDeleteInfo.type);
            setShowDeletMessageOption(false);
        } catch (error) {
            console.log("failed to delete the specified message", error);
        }
    }
    console.log("the options defined are", optionsSelected);
    return (
        <div>
            {showDeleteMessageOptions &&
                <DeleteMessage deleteMessage={deleteMessage} />
            }
    
            <div className="lg:flex">
                <SideBar
                    setOptions={selectedOptionSetter}
                    profilePictureUrl={profilePictureUrl}
                />
    
                {optionsSelected === 6 &&
                    <Profile
                        userData={userData}
                        profilePictureUrl={profilePictureUrl}
                        isUserChangedSetter={isUserChangedSetter}
                    />
                }
                {optionsSelected !== 6 &&
                    <div className={`${display} lg:inline h-screen w-full lg:ml-16 lg:w-[23rem]  bg-black lg:border-r-2
                        lg:border-[#555555] text-white`}>
                        <div className="border-b-2 border-[#555555] h-24 lg:h-20 flex justify-start items-center">
                            <div className="flex justify-between items-center h-auto w-[90%] ml-5">
                                <div className="flex justify-center items-center">
                                    <FaList size={18} />
                                    <p className="font-bold text-xl ml-3">
                                        {headerText}
                                    </p>
                                </div>
                                {optionsSelected === 4 &&
                                    <Link to={"/create-new-group"} state={{ friends: userData.friends }} className="hover:scale-105">
                                        <CiCirclePlus size={30} />
                                    </Link>
                                }
    
                            </div>
    
                        </div>
    
                        <div className="bg-[#1b1b1b] w-full lg:w-[22rem] h-[87vh] overflow-y-scroll noScroll">
                            {optionsSelected === 1 && chatList.map((chat, index) => {
                                if (optionsSelected === 1) {
                                    return (
                                        <Messages
                                            key={index}
                                            data={chat}
                                            selectedChatSetter={selectedChatSetter}
                                            getChatData={getChatData}
                                            chatFriendImageSetter={chatFriendImageSetter}
                                        />
                                    )
                                }
                            })}
                            {optionsSelected !== 1 && dataArray.map((data, index) => {
                                if (optionsSelected === 2) {
                                    return (
                                        <Friends
                                            key={index}
                                            data={data}
                                            selectedChatSetter={selectedChatSetter}
                                            selectedOptionSetter={selectedOptionSetter}
                                            isUserChangedSetter={isUserChangedSetter}
                                            removeFriendFromDataArray={removeFollowRequestAndFriend}
                                            getChatData={getChatData}
                                        />
                                    )
                                }
                                if (optionsSelected === 3) {
                                    return (
                                        <FriendRequests
                                            key={index}
                                            data={data}
                                            isUserChangedSetter={isUserChangedSetter}
                                            removeFollowRequest={removeFollowRequestAndFriend}
                                        />
                                    )
                                }
                                if (optionsSelected === 4) {
                                    return (
                                        <GroupMessagesList
                                            key={index}
                                            data={data}
                                            userData={userData}
                                            selectedChatSetter={selectedChatSetter}
                                            getChatData={getChatData}
                                            chatFriendImageSetter={chatFriendImageSetter}
                                        />
                                    )
                                }
                                if (optionsSelected === 5) {
                                    if (userData._id !== data._id && userData.friends.includes(data._id) === false) {
                                        return (
                                            <Users
                                                key={index}
                                                data={data}
                                                userData={userData}
                                                addToSentRequests={addToSentRequests}
                                                isUserChangedSetter={isUserChangedSetter}
                                            />
                                        )
                                    }
                                }
                            })}
                        </div>
                    </div>
                }
    
                   {console.log('the friend data is', userData)}
                {optionsSelected !== 6 && selectedChat === "normal" &&
                    <Chat
                        selectedChatSetter={selectedChatSetter}
                        chatData={chatData}
                        friendData={friendData}
                        userData={userData}
                        sendMessageToWS={sendMessageToWS}
                        chatDataSetter={chatDataSetter}
                        friendChatImage={friendChatImage}
                        handleMessageDelete={handleMessageDelete}
                    />}
                {optionsSelected !== 6 && selectedChat === "group" &&
                    <GroupChat
                        userData={userData}
                        data={groupChatData}
                        groupImage={friendChatImage}
                        selectedChatSetter={selectedChatSetter}
                        groupData={groupData}
                        chatDataSetter={chatDataSetter}
                        sendMessageToWS={sendMessageToWS}
                        handleMessageDelete={handleMessageDelete}
                    />}
                {optionsSelected !== 6 && !selectedChat &&
                    <div className="hidden bg-black h-screen w-full lg:flex justify-center items-center text-white text-2xl">
                        <p>
                            No Chat Selected
                        </p>
                    </div>
                }
            </div>
        </div>
    )
}