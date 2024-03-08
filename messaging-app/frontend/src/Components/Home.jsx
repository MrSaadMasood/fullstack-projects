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
    // based on the option the specific data is fetched and shown
    const [optionsSelected, setOptionsSelected] = useState(1);
    const [headerText, setHeaderText] = useState("Chats");
    // the selected chat type is used to dispalay various components 
    const [selectedChat, setSelectedChat] = useState(null);
    // for storing the friends, request, users, group chat list etc.
    const [dataArray, setDataArray] = useState([]);
    const [userData, setUserData] = useState(null);
    // for storing that chat list data so that if the user selectes another option this data persists and not fetched every time
    const [chatList, setChatList] = useState([]);
    // basically used if the auth tokens are refershed then the user data is fetched again. Also when the database is updated with 
    // some data and userData needs to be updated with that data
    const [isUserChanged, setIsUserChanged] = useState(false);
    // the selected chat data containing all the messages
    const [chatData, setChatData] = useState({ chat: [] });
    // the selected group chat data containing all the messages
    const [groupChatData, setGroupChatData] = useState([]);
    // data of the selected friend whom the user is chatting
    const [friendData, setFriendData] = useState({});
    // for socket instance
    const [socket, setSocket] = useState(null);
    // to stored the room id
    const [joinedRoom, setJoinedRoom] = useState(null);
    // the data of the group the user is messaging in
    const [groupData, setGroupData] = useState({});
    // user profile picture url
    const [profilePictureUrl, setProfilePictureUrl] = useState("/placeholder.png");
    // friend profile picture
    const [friendChatImage, setFriendChatImage] = useState("/placeholder.png");
    // to store the message to be deleted
    const [messageToDeleteInfo, setMessageToDeleteInfo] = useState({});
    const [showDeleteMessageOptions, setShowDeletMessageOption] = useState(false);
    const axiosPrivate = useInterceptor();
    const display = selectedChat ? "hidden" : "";

    // create a socket instance when the component renders/ mounts
    useEffect(() => {
        const socket = io("http://localhost:3000");
        setSocket(socket);

        // to set the room id so that the other user can connect to the same room
        socket.on("joined-chat", (roomId) => {
            setJoinedRoom(roomId);
        });

        // to add the message received from the user in the chat / group chat data simultaneously
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

        // to delete the message that other user deleted from this users chat/ group chat
        socket.on("delete-message", (id, type) => {
            removeDeletedMessageFromChat(id, type);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // based on the type of the option selection specific get request are made to the server to fetch the data
    useEffect(() => {
        // to get the normal chat list of the user with friends containing the friend name and last message
        if (optionsSelected === 1) {
            axiosPrivate.get("/user/get-chatlist").then((res) => {
                setChatList(res.data.chatList);
            }).catch((error) => {
                console.log("error occured while getting the chat list", error);
                setDataArray([]);
            });
        }

        // to get all the friends of the user
        if (optionsSelected === 2) {
            axiosPrivate.get("/user/get-friends").then((res) => {
                if (res.status === 200) {
                    setDataArray(res.data.friends);
                }
            }).catch(() => {
                setDataArray([]);
            });
        }

        // to get the follow request sent to the user
        if (optionsSelected === 3) {
            axiosPrivate.get("/user/follow-requests").then((res) => {
                setDataArray(res.data.receivedRequests);
            }).catch((error) => {
                console.log("failed while getting the follow requests", error);
                setDataArray([]);
            });
        }

        // to get group chats with last message and group name
        if (optionsSelected === 4) {
            axiosPrivate.get("/user/group-chats").then((res) => {
                setDataArray(res.data.groupChats);
            }).catch((error) => {
                console.log("failed to get the group chats ", error);
                setDataArray([]);
            });
        }

        // to get all the users of the app
        if (optionsSelected === 5) {
            axiosPrivate.get("/user/get-users").then((res) => {
                setDataArray(res.data.users);
            }).catch((error) => {
                console.log("cannot get the users", error);
                setDataArray([]);
            });
        }
    }, [optionsSelected, axiosPrivate]);

    // on component mount the userData is fetched from the server
    useEffect(() => {
        getUserData();
    }, [axiosPrivate]);

    // when ever the data is updated in the database and the user needs to be updated
    useEffect(() => {
        if (isUserChanged) {
            getUserData();
            setIsUserChanged(false);
        }
    }, [axiosPrivate, isUserChanged]);

    // get the data from the database of the user and if the user data contains the profile picture the
    // blob is fetched and then converted to url that is displayed.
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

    // this adds the user that is sent the request to the sent reques array and that user is shown as "request sent". so no
    // further request are made
    function addToSentRequests(id) {
        setUserData((prevData) => {
            prevData.sentRequests.push(id);
            return { ...prevData };
        });
    }

    // when the friend is added the follow request of that friend is removed from the data
    function removeFollowRequestAndFriend(id) {
        setDataArray((prevData) => {
            const updatedArray = prevData.filter(item => {
                return item._id !== id;
            });
            return updatedArray;
        });
    }

    // to set the type of chat and based on that normal chat or group chats component is rendered
    function selectedChatSetter(chat) {
        setSelectedChat(chat);
    }

    // sets the option selected and also the header text based on the option
    function selectedOptionSetter(option, text) {
        setOptionsSelected(option);
        setHeaderText(text);
    }

    // sets if the user data is changed and based on that a fetch request is made
    function isUserChangedSetter(value) {
        setIsUserChanged(value);
    }

    // generate a room id so users can connect to this room
    function generateRoomId(userId, friendId) {
        const sortedArray = [userId, friendId].sort();
        return `room${sortedArray[0]},${sortedArray[1]}`;
    }

    // gets the chat data based on the type and stores that data in tha appropriate state
    // also the room id is generated which is sent to the server so that other users can also connect to that same room id
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

    // depending on the type of chat the last message is updated in the list of chats / group chats.
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
    
    // depending on the chat types specific data is sent to the sockets.
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
    
    // depending upon the type the if the user sends the message to other user the message is updated in the users chat
    // group chats array
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
    
    // to set the image of the selected friend to chat
    function chatFriendImageSetter(url) {
        setFriendChatImage(url);
    }
    
    // handles the deletion of message message stored the message to delete data in state
    function handleMessageDelete(messageId, type) {
        setMessageToDeleteInfo({
            collectionId: type === "normal" ? chatData._id : groupChatData[0]._id,
            type: type,
            messageId
        });
        setShowDeletMessageOption(true);
    }
    
    // based on the type the speicific message is deleted form the chat array and the id is sent to the sockers 
    // when the same message is removed from the other users chat array
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
    
    // to delete the selected from the database and subsequntly from the chat array
    async function deleteMessage() {
        try {
            await axiosPrivate.delete(`/user/delete-message?data=${JSON.stringify(messageToDeleteInfo)}`);
            removeDeletedMessageFromChat(messageToDeleteInfo.messageId, messageToDeleteInfo.type);
            setShowDeletMessageOption(false);
        } catch (error) {
            console.log("failed to delete the specified message", error);
        }
    }
    
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
                                    <Link 
                                        to={"/create-new-group"} 
                                        state={{ friends: userData.friends }} 
                                        className="hover:scale-105"
                                    >
                                        <button data-testid="newGroup">
                                            <CiCirclePlus size={30} />
                                        </button>
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