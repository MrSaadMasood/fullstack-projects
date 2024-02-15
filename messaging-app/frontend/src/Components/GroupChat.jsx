import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"

import ChatHeader from "./ChatHeader";
import ErrorBox from "./ErrorBox";
import ChatForm from "./Forms/ChatForm";
import LeftSideBox from "./LeftSideBox";
import RightSideBox from "./RightSideBox";
import useInterceptor from "./hooks/useInterceptors";

GroupChat.propTypes = {

    selectedChatSetter : PropTypes.func,
    chatDataSetter : PropTypes.func,
    handleMessageDelete : PropTypes.func,
    sendMessageToWS : PropTypes.func,

    data : PropTypes.arrayOf(PropTypes.shape({
        senderName : PropTypes.string.isRequired,
        chat : PropTypes.shape({
            userId : PropTypes.string.isRequired
        })
    })),
    groupData : PropTypes.shape({
        _id : PropTypes.string.isRequired,
        senderName : PropTypes.string.isRequired
    }),
    groupImage : PropTypes.string,
    userData : PropTypes.shape({
        _id : PropTypes.string.isRequired,
        fullName : PropTypes.string.isRequired
    })
}
export default function GroupChat({
    data,
    selectedChatSetter,
    groupData,
    groupImage,
    userData,
    chatDataSetter,
    handleMessageDelete,
    sendMessageToWS
}) {
    const chatDiv = useRef(null);
    const axiosPrivate = useInterceptor();
    const [input, setInput] = useState("");

    // to scroll the overflowing div to the bottom
    useEffect(() => {
        const div = chatDiv.current;

        function scrollToBottom() {
            div.scrollTop = div.scrollHeight;
        }

        scrollToBottom();
    }, [data]);

    function onChange(e) {
        setInput(e.target.value);
    }
    // handles the message submission and then sends the message to the user connected to the same room
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const response = await axiosPrivate.post("/user/group-data", {
                groupId: groupData._id,
                content: input
            });
            sendMessageToWS(groupData, input, response.data.id, "group");
            e.target.reset();
        } catch (error) {
            console.log("Error occurred while sending the message", error);
        }
    }

    // handles the image submission and then sends the message to the user connected to the same room
    async function handleFileChange(e) {
        const image = e.target.files[0];

        if (image.size > 500000) {
            const data = {
                senderName: userData.fullName,
                chat: {
                    content: "Image should be less than 500kb",
                    userId: userData._id,
                    time: new Date(),
                    error: true
                }
            };
            return chatDataSetter(data, "group");
        }

        try {
            const response = await axiosPrivate.post(
                "/user/add-group-chat-image",
                { groupId: groupData._id, image },
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            const { filename, id } = response.data;
            groupData.senderName = userData.fullName;
            sendMessageToWS(groupData, filename, id, "group", "path");
        } catch (error) {
            console.log("Error occurred while sending the image to the server", error);
        }
    }

    function deleteMessage(id) {
        handleMessageDelete(id, "group");
    }

    return (
        <div className="lg:w-full">
            <ChatHeader
                selectedChatSetter={selectedChatSetter}
                friendData={groupData}
                friendChatImage={groupImage}
            />

            <div
                ref={chatDiv}
                className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative 
                bg-black w-full lg:w-full overflow-y-scroll noScroll"
            >
                {data.map((chatData, index) => {
                    if (chatData.chat.error && chatData.chat.userId === userData._id) {
                        return <ErrorBox key={index} data={chatData.chat} />;
                    }
                    if (chatData.chat.userId === userData._id) {
                        return (
                            <RightSideBox
                                key={index}
                                data={chatData.chat}
                                deleteMessage={deleteMessage}
                                chatType="group"
                                sender={chatData.senderName}
                            />
                        );
                    } else {
                        return (
                            <LeftSideBox
                                chatType="group"
                                key={index}
                                data={chatData.chat}
                                sender={chatData.senderName}
                            />
                        );
                    }
                })}
            </div>
            <div>
                <ChatForm
                    handleFileChange={handleFileChange}
                    handleSubmit={handleSubmit}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
