import { IoArrowBackCircleOutline } from "react-icons/io5";

export default function ChatHeader({ selectedChatSetter, friendData,  friendChatImage}){
    function goBack(){
        selectedChatSetter(null)
    }
    return (
        <div className=" h-16 sm:h-20 md:h-24 lg:h-20 bg-black border-b-2 border-[#555555] text-white
        flex justify-start items-center">
            <div className="  w-auto  h-14  ml-4 md:ml-8 lg:ml-3 flex justify-start items-center">
                <button onClick={goBack} className=" lg:hidden">
                    <IoArrowBackCircleOutline size={25} />
                </button>
                <div className=" flex justify-center items-center">
                    <div className=" h-10 md:h-14 w-10 md:w-14 rounded-full ml-6 overflow-hidden">
                        <img src={friendChatImage} alt="" width={"300px"} />
                    </div>
                    <p className=" ml-3 sm:text-lg md:text-xl">
                        { friendData.fullName || friendData.groupName}
                    </p>
                </div>
            </div>
        </div>
    )
}