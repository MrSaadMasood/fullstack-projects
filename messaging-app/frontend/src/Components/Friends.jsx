import { useState } from "react";
import useInterceptor from "./hooks/useInterceptors";
import PropTypes from "prop-types"

export default function Friends({ 
    data,
    selectedChatSetter, 
    selectedOptionSetter, 
    isUserChangedSetter, 
    removeFriendFromDataArray,
    getChatData
}){
    
    const axiosPrivate = useInterceptor()
    const [loading, setLoading] = useState(false)

    function sendMessage(data){
        selectedOptionSetter(1, "Chats")
        selectedChatSetter("normal")
        getChatData(data, "normal")
    }

    async function removeFriend(id){
        try {
            setLoading(true)
            await axiosPrivate.delete(`/user/remove-friend/${id}`)
            isUserChangedSetter(true) 
            removeFriendFromDataArray(id)
            setLoading(false)
        } catch (error) {
            console.log("error while removing the friends", error)
            setLoading(false)
        }
    }
    return(
        <div className=" p-3 flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20">
            <div className=" flex justify-center items-center">
                <div className=" w-14 h-14 lg:w-10 lg:h-10 rounded-full bg-pink-400">

                </div>
                <div className=" h-16 lg:h-12 w-[75vw] lg:w-[16.75rem] sm:w-[80vw] md:w-[85vw] flex flex-col justify-between items-start
                 ml-3 sm:ml-3 md:ml-5">
                    <p className="font-bold lg:w-48 lg:overflow-hidden text-base sm:text-lg lg:text-sm">
                        {data.fullName}
                    </p>
                    <div className=" h-8 lg:h-6 w-[100%] flex justify-between items-center">
                        <button onClick={()=>sendMessage(data)} 
                        className=" bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md">
                            Message
                        </button>
                        <button 
                        onClick={()=>removeFriend(data._id)} 
                        className=" bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md"
                        disabled={loading}
                        >
                            {loading ? "Removing" : "Remove"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

Friends.propTypes = {
    data : PropTypes.shape({
        _id : PropTypes.string.isRequired,
        fullName : PropTypes.string.isRequired
    }),
    selectedChatSetter : PropTypes.func,
    selectedOptionSetter : PropTypes.func,
    isUserChangedSetter : PropTypes.func,
    removeFriendFromDataArray : PropTypes.func,
    getChatData : PropTypes.func
}