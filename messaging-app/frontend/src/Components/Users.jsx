import useInterceptor from "./hooks/useInterceptors"

export default function Users({ data, userData, addToSentRequests }){
    const axiosPrivate = useInterceptor()
    const isRequestSend = userData.sentRequests.includes(data._id)
    const backgroundColor = isRequestSend ? "bg-red-400" : " bg-red-600 hover:bg-red-700" 
    async function sendRequest(){
        try {
            const response = await axiosPrivate.post("/user/send-request", { senderId : userData._id, receiverId : data._id})  
            addToSentRequests(data._id)
        } catch (error) {
            console.log("the request sent failed");
        }
     }
    return (
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
                        <button className={`h-[100%] w-[95%] rounded-md ${backgroundColor} `} 
                        onClick={(e)=>sendRequest(data._id)} disabled={isRequestSend}>
                            {isRequestSend ? "Request Sent" : "Follow"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}