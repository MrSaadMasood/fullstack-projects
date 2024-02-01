import { FaCamera } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { FaEdit } from "react-icons/fa"
export default function Profile(){
    return (
    <div className=" lg:ml-16 lg:w-full lg:h-screen">
        <div className="w-full bg-black text-white border-b-2 border-[#555555] h-16 flex justify-between items-center p-3 ">
            <h2>My Profile</h2>
            <div className=" bg-red-500 w-[30%] sm:w-[20%] md:w-[16%] lg:w-[14%] xl:w-[10%] flex justify-between items-center">
                <div className=" bg-blue-300 h-10 w-10 rounded-full">

                </div>
                <h2>
                    username
                </h2>
            </div>
        </div>
        <div className=" h-[95vh] lg:h-[100vh] text-white bg-black flex flex-col justify-center items-center">
            <div className=" bg-blue-500 h-44 w-44 sm:h-60 sm:w-60 rounded-full relative">
                <button className=" absolute bottom-0 right-7 sm:right-9 flex justify-center items-center
                 h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-400 ">
                    <FaCamera size={30} color="black" className=" h-6 sm:h-12" />
                </button>
            </div>
            <div className=" flex justify-between items-center h-16 w-24 sm:w-28 mt-3 sm:mt-5">
                <h3 className="text-3xl sm:text-4xl font-bold">Bio</h3>
                <button className=""> 
                <FaEdit size={30} />
                </button>
            </div>
            <div className=" bg-[#777777] relative w-60 sm:w-[25rem] h-auto rounded-lg text-center break-all p-2 sm:p-3 mt-3">
                <p className=" md:text-lg">
                    hi this is saad masood i am learning software enginnering this is really interesting work i love it
                </p>
            </div>
        </div>
    </div>
    )
}