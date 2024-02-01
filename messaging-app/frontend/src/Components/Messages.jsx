
export default function Messages({ item, selectedChatSetter, type = 1 }){
    return (
        <button className={` hover:bg-[#343434] w-full p-3 flex lg:flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20`}
        onClick={()=>{ selectedChatSetter(item)}}>
            <div className=" flex justify-center items-center">
                <div className=" w-14 h-14 lg:w-10 lg:h-10 rounded-full bg-pink-400">

                </div>
                <div className="  h-16 lg:h-12 w-[17rem] lg:w-[13rem] sm:w-[26rem] flex flex-col justify-around items-start ml-2 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {item}
                    </p>
                    { type === 1 && 
                        <p className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] w-[16rem] sm:w-[22rem] lg:w-[11rem]
                         flex overflow-hidden ">
                            last message
                        </p>
                    }
                    { type === 2 && 
                        <div className=" text-sm sm:text-base lg:text-xs text-[#b2b2b2] w-[16rem] sm:w-[22rem] lg:w-[11rem] 
                        overflow-hidden
                        flex justify-start items-center" >
                            <p>
                                User
                            </p>
                            <p className=" w-[10rem] h-4 ml-1 overflow-hidden">
                                lastsdsfasdffkkkkkkkkkkkkkkkkkjjjjjjjjjjjjjjjjjj
                            </p>
                        </div>
                    }
                </div>
            </div>
            <div className=" h-16 w-20 lg:h-12 lg:w-14 flex flex-col justify-start items-center ml-1">
                <p className=" text-xs">
                    time
                </p>
            </div>
        </button >
    )
}