
export default function FriendRequests({ item }){
    return (
        <div className=" p-3 flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20">
            <div className=" flex justify-center items-center">
                <div className=" w-14 h-14 lg:w-10 lg:h-10 rounded-full bg-pink-400">

                </div>
                <div className=" h-16 lg:h-12 w-[75vw] lg:w-[16.75rem] sm:w-[80vw] md:w-[85vw] flex flex-col justify-between items-start
                 ml-3 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {item}
                    </p>
                    <div className=" h-8 w-[100%] flex justify-between items-center">
                        <button className=" bg-red-500 h-[100%] w-[45%] rounded-md">
                            Accept
                        </button>
                        <button className="  bg-red-500 h-[100%] w-[45%] rounded-md ">
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}