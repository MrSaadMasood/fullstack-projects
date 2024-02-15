import { useEffect, useState } from "react";
import useInterceptor from "./hooks/useInterceptors";
import PropTypes from "prop-types"

LeftSideBox.propTypes = {
    sender : PropTypes.string,
    chatType : PropTypes.string,
    data : PropTypes.shape({
        time : PropTypes.string.isRequired,
        path : PropTypes.string,
        content : PropTypes.string
    })
}
export default function LeftSideBox({ 
    data, 
    sender, 
    chatType = "normal" 
}) {
    const axiosPrivate = useInterceptor();
    const [url, setUrl] = useState("");
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
        }

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [data, axiosPrivate, chatType]);

    return (
        <div className="text-white text-base w-[100%] h-auto mb-2 
        flex justify-start items-center">
            <div className="w-[60%] ml-3 h-auto flex flex-col justify-between items-start">
                <div className="text-[.5rem] h-4 w-auto flex justify-between items-center">
                    <p>
                        {dateObject.toDateString()}
                    </p>
                    {sender &&
                        <p className="ml-2">
                            {sender}
                        </p>
                    }
                </div>
                {data.content &&
                    <p className="pt-1 pb-1 pl-2 pr-2 bg-orange-600 h-auto w-auto break-all 
                        left-box flex justify-center items-center">
                        {data.content}
                    </p>
                }
                {data.path &&
                    <div>
                        <img src={url} alt="" width={"300px"} />
                    </div>
                }
            </div>
        </div>
    );
}
