import { useState } from "react"
import useInterceptor from "./hooks/useInterceptors"
import PropTypes from "prop-types"


export default function FriendRequests({ 
    data,  
    isUserChangedSetter, 
    removeFollowRequest 
}){
    // loading states for access and decline buttons
    const axiosPrivate = useInterceptor()
    const [acceptLoading, setAcceptLoading] = useState(false)
    const [declineLoading, setDeclineLoading] = useState(false)
    
    async function addFriend(id){
        try {
            setAcceptLoading(true)
            await axiosPrivate.post("/user/add-friend", { friendId : id})
            isUserChangedSetter(true)
            removeFollowRequest(id)
            setAcceptLoading(false)
        } catch (error) {
           console.log("failed to add friend", error) 
            setAcceptLoading(false)
        }
    }

    async function removeRequest(id){
        try {
            setDeclineLoading(true)
            await axiosPrivate.delete(`/user/remove-follow-request/${id}`)
            isUserChangedSetter(true)
            removeFollowRequest(id)
            setDeclineLoading(false)
        } catch (error) {
            console.log("failed to add friend", error) 
            setDeclineLoading(false)
        }
    }
    return (
        <div className=" p-3 flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20">
            <div className=" flex justify-center items-center">
                <div className=" w-14 h-14 lg:w-10 lg:h-10 rounded-full bg-pink-400">

                </div>
                <div className=" h-16 lg:h-12 w-[75vw] lg:w-[16.75rem] sm:w-[80vw] md:w-[85vw] flex flex-col justify-between items-start
                 ml-3 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {data.fullName}
                    </p>
                    <div className=" h-8 w-[100%] flex justify-between items-center">
                        <button className=" bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md"
                        onClick={()=>addFriend(data._id)}
                        disabled={acceptLoading}>
                            {acceptLoading ? "Accepting" : "Accept"}
                        </button>
                        <button className="  bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md " 
                        onClick={()=>removeRequest(data._id)}
                        disabled={declineLoading}>
                            {declineLoading ? "Decligning" : "Decline"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

FriendRequests.propTypes = {
    data : PropTypes.shape({
        _id : PropTypes.string.isRequired,
        fullName : PropTypes.string.isRequired,
    }),
    isUserChangedSetter : PropTypes.func,
    removeFollowRequest : PropTypes.func
}