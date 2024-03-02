import { useEffect, useState } from "react";
import useInterceptor from "./hooks/useInterceptors";
import PropTypes from "prop-types"

RightSideBox.propTypes = {
    sender : PropTypes.string,
    chatType : PropTypes.string,
    data : PropTypes.shape({
        time : PropTypes.string,
        path : PropTypes.string,
        content : PropTypes.string,
        id : PropTypes.string.isRequired
    }),
    deleteMessage : PropTypes.func
}
export default function RightSideBox({ 
    data, 
    sender, 
    deleteMessage, 
    chatType = "normal" 
}) {
    const [url, setUrl] = useState("");
    const axiosPrivate = useInterceptor();
    const dateObject = new Date(data.time);

    // if the chat contains a path to the image the data is fetched converted to url and shown 
    useEffect(() => {
        async function getChatImage(image) {
            try {
                if (chatType === "normal") {
                    const response = await axiosPrivate.get(`/user/get-chat-image/${image}`, { responseType: "blob" });
                    const imageUrl = URL.createObjectURL(response.data);
                    setUrl(imageUrl);
                }
                if (chatType === "group") {
                    const response = await axiosPrivate.get(`/user/group-picture/${image}`, { responseType: "blob" });
                    const imageUrl = URL.createObjectURL(response.data);
                    setUrl(imageUrl);
                }
            } catch (error) {
                return "/pattern.jpg";
            }
        }

        if (data.path) {
            getChatImage(data.path);
            
            return () => {
                URL.revokeObjectURL(url);
            };
        }

    }, [data, axiosPrivate, chatType]);

    return (
        <div 
            onDoubleClick={() => deleteMessage(data.id)} 
            data-testid="main"
            className="text-white text-base w-[100%] h-auto mb-2 flex justify-end items-center"
        >
            <div className="w-[60%] mr-3 h-auto flex flex-col justify-between items-end">
                <div className="text-[.5rem] h-4 w-auto flex justify-around items-center">
                    {sender &&
                        <p className="mr-2">
                            {sender}
                        </p>
                    }
                    <p className="">
                        {dateObject.toDateString()}
                    </p>
                </div>
                {data.content &&
                    <p className="pt-1 pb-1 pl-2 pr-2 bg-orange-600 h-auto w-auto break-all right-box flex 
                    justify-center items-center">
                        {data.content}
                    </p>
                }
                {data.path &&
                    <div>
                        <img src={url} alt="img" width={"300px"} />
                    </div>
                }
            </div>
        </div>
    );
}
