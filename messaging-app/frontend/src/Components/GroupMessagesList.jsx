import { useEffect, useState } from "react";
import PropTypes from "prop-types"
import useInterceptor from "./hooks/useInterceptors";

GroupMessagesList.propTypes = {
    selectedChatSetter : PropTypes.func,
    getChatData : PropTypes.func,
    chatFriendImageSetter : PropTypes.func,
    data : PropTypes.shape({
        lastMessage : PropTypes.shape({
            time : PropTypes.string.isRequired,
            content : PropTypes.string,
            path : PropTypes.string,
            userId : PropTypes.string.isRequired
        }),
        groupImage : PropTypes.string,
        groupName : PropTypes.string,
        senderName : PropTypes.string,
    }),
    userData : PropTypes.shape({
        _id : PropTypes.string.isRequired
    })
}
export default function GroupMessagesList({
    data,
    userData,
    selectedChatSetter,
    getChatData,
    chatFriendImageSetter,
}) {

    const dateObject = new Date(data?.lastMessage?.time);
    const [picture, setPicture] = useState("/placeholder.png");
    const axiosPrivate = useInterceptor();

    // if data contains the path to the image, the image blob fetched from the server and is converted to object url which is then
    // used to display the image of each group  
    useEffect(() => {
        async function getChatImage(image) {
            try {
                const response = await axiosPrivate.get(
                    `/user/group-picture/${image}`,
                    { responseType: "blob" }
                );
                const imageUrl = URL.createObjectURL(response.data);
                setPicture(imageUrl);
                return () => {
                    URL.revokeObjectURL(imageUrl);
                };
            } catch (error) {
                console.error("Error fetching group image:", error);
            }
        }

        if (data.groupImage) {
            getChatImage(data.groupImage);
        }
    }, [axiosPrivate, data.groupImage]);

    return (
        <button
            className={`hover:bg-[#343434] w-full p-3 flex lg:flex justify-between items-center 
            border-b-2 border-[#555555] h-28 lg:h-20`}
            onClick={() => {
                selectedChatSetter("group");
                getChatData(data, "group");
                chatFriendImageSetter(picture);
            }}
        >
            <div className="flex justify-center items-center">
                <div className="w-14 h-14 lg:w-10 lg:h-10 rounded-full overflow-hidden">
                    <img src={picture} alt="" width={"300px"} />
                </div>
                <div className="h-16 lg:h-12 w-[17rem] lg:w-[13rem] sm:w-[26rem] flex flex-col justify-around items-start ml-2 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {data.groupName}
                    </p>
                    {data?.lastMessage?.path && 
                        <p className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] h-5 w-[16rem] 
                        sm:w-[22rem] lg:w-[10rem] flex overflow-hidden">
                            Image
                        </p>
                    }
                    {data?.lastMessage?.content && 
                        <div className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] w-[16rem] 
                        sm:w-[22rem] lg:w-[14rem] text-left">
                            <p className="w-[100%] h-4">
                                {data.lastMessage.userId === userData._id ? "You" : data.senderName}:
                                <span> </span>
                                {data.lastMessage.content}
                            </p>
                        </div>
                    }
                </div>
            </div>
            <div className="h-16 w-20 lg:h-12 lg:w-14 flex flex-col justify-start items-center ml-1">
                <p className="text-xs">{dateObject?.toLocaleDateString()}</p>
            </div>
        </button>
    );
}
