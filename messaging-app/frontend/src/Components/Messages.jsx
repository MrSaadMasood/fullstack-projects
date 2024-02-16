import { useEffect, useState } from "react";
import useInterceptor from "./hooks/useInterceptors";
import PropTypes from "prop-types"

Messages.propTypes = {
    selectedChatSetter : PropTypes.func,
    getChatData : PropTypes.func,
    chatFriendImageSetter : PropTypes.func,
    data : PropTypes.shape({
        lastMessage : PropTypes.shape({
            time : PropTypes.string.isRequired,
            content : PropTypes.string,
            path : PropTypes.string,
        }),
        friendData : PropTypes.shape({
            profilePicture : PropTypes.string,
            fullName : PropTypes.string.isRequired
        })
    })
}
export default function Messages({ 
    data, 
    selectedChatSetter, 
    getChatData, 
    chatFriendImageSetter 
}) {
    
    const [picture, setPicture] = useState("/placeholder.png");
    const axiosPrivate = useInterceptor();
    const dateObject = new Date(data?.lastMessage?.time);

    // if the chat list contains a path to the image the data is fetched converted to url and shown 
    useEffect(() => {
        async function getChatImage(image) {
            try {
                const response = await axiosPrivate.get(`/user/get-profile-picture/${image}`, { responseType: "blob" });
                const imageUrl = URL.createObjectURL(response.data);
                setPicture(imageUrl);

                return () => {
                    URL.revokeObjectURL(imageUrl);
                };
            } catch (error) {
                return;
            }
        }

        if (data.friendData.profilePicture) {
            getChatImage(data.friendData.profilePicture);
        }

    }, [axiosPrivate, data.friendData.profilePicture]);

    return (
        <button className={`hover:bg-[#343434] w-full p-3 flex lg:flex justify-between items-center border-b-2 
        border-[#555555] h-28 lg:h-20`}
            onClick={() => { 
                selectedChatSetter("normal"); 
                getChatData(data.friendData, "normal"); 
                chatFriendImageSetter(picture) 
            }}>

            <div className="flex justify-center items-center">
                <div className="w-14 h-14 lg:w-10 lg:h-10 rounded-full overflow-hidden">
                    <img src={picture} alt="" width={"300px"} />
                </div>

                <div className="h-16 lg:h-12 w-[17rem] lg:w-[13rem] sm:w-[26rem] flex flex-col justify-around items-start
                text-left ml-2 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {data?.friendData.fullName}
                    </p>

                    {data.lastMessage.content &&
                        <p className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] h-5 w-[16rem] sm:w-[22rem] lg:w-[10rem] flex overflow-hidden ">
                            {data?.lastMessage?.content}
                        </p>
                    }

                    {data.lastMessage.path &&
                        <p className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] h-5 w-[16rem] sm:w-[22rem] lg:w-[10rem] flex overflow-hidden ">
                            Image Received
                        </p>
                    }
                </div>
            </div>

            <div className="h-16 w-20 lg:h-12 lg:w-14 flex flex-col justify-start items-center ml-1">
                <p className="text-xs">
                    {dateObject?.toLocaleDateString()}
                </p>
            </div>
        </button>
    );
}
