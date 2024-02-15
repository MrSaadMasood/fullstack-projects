import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import useInterceptor from "./hooks/useInterceptors";
import ErrorBox from "./ErrorBox";
import ChatForm from "./Forms/ChatForm";
import ChatHeader from "./ChatHeader";
import LeftSideBox from "./LeftSideBox";
import RightSideBox from "./RightSideBox";

export default function Chat({
  selectedChatSetter,
  chatData,
  friendData,
  userData,
  sendMessageToWS,
  chatDataSetter,
  handleMessageDelete,
  friendChatImage,
}) {
  const chatDiv = useRef();
  const axiosPrivate = useInterceptor();
  const [input, setInput] = useState("");
  const realChat = chatData?.chat;

  useEffect(() => {
    const div = chatDiv.current;
    function scrollToBottom() {
      div.scrollTop = div.scrollHeight;
    }

    scrollToBottom();
  }, [chatData]);

    function onChange(e) {
        setInput(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
        const response = await axiosPrivate.post("/user/chat-data", {
        friendId: friendData._id,
        content: input,
        });
        sendMessageToWS(friendData, input, response.data.id);
        e.target.reset();
    } 
    catch (error) {
        console.log("Error occurred while sending the message", error);
    }
  }

  async function handleFileChange(e) {
    const image = e.target.files[0];
    if (image.size > 500000) {
      return chatDataSetter({
        content: "Image should be less than 500kb",
        userId: userData._id,
        time: new Date(),
        error: true,
        });
    }
    try {
        const response = await axiosPrivate.post(
        "/user/add-chat-image",
        { friendId: friendData._id, image },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
        );
        const { filename, id } = response.data;
        sendMessageToWS(friendData, filename, id, "normal", "path");
    } catch (error) {
        console.log("Error occurred while sending the image to the server", error);
    }
  }

  function deleteMessage(id) {
    handleMessageDelete(id, "normal");
  }

  return (
    <div className="lg:w-full">
        <ChatHeader
        selectedChatSetter={selectedChatSetter}
        friendData={friendData}
        friendChatImage={friendChatImage}
        />

        <div
        ref={chatDiv}
        className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative
        bg-black w-full lg:w-full overflow-y-scroll noScroll"
        >
        {realChat?.map((chat, index) => {
            if (chat.error && chat.userId === userData._id) {
                return <ErrorBox key={index} data={chat} />;
        }
            if (chat.userId === userData._id) {
                return <RightSideBox key={index} data={chat} deleteMessage={deleteMessage} />;
        } 
            else {
                return <LeftSideBox key={index} data={chat} />;
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

Chat.propTypes = {
    selectedChatSetter : PropTypes.func,
    chatData : PropTypes.shape({
      _id : PropTypes.string,
      chat : PropTypes.arrayOf(PropTypes.shape({
          content : PropTypes.string.isRequired,
          id : PropTypes.string.isRequired,
          userId : PropTypes.string.isRequired,
          time : PropTypes.string.isRequired
      }))
    }),
    friendData : PropTypes.shape({
        fullName : PropTypes.string.isRequired,
        profilePicture : PropTypes.string.isRequired,
        _id : PropTypes.string.isRequired
    }),
    userData : PropTypes.shape({
        bio : PropTypes.string.isRequired,
        friends : PropTypes.arrayOf(PropTypes.string),
        fullName : PropTypes.string.isRequired,
        groupChats : PropTypes.arrayOf(PropTypes.object),
        normalChats : PropTypes.arrayOf(PropTypes.object),
        receivedRequests : PropTypes.arrayOf(PropTypes.string),
        profilePicture : PropTypes.string.isRequired,
        sentRequests : PropTypes.arrayOf(PropTypes.string),
        _id : PropTypes.string.isRequired
    }),
    sendMessageToWS : PropTypes.func,
    chatDataSetter : PropTypes.func,
    friendChatImage : PropTypes.string,
    handleMessageDelete : PropTypes.func

}