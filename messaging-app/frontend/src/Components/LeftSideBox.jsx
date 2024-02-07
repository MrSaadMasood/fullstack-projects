export default function LeftSideBox( { data} ){
    const dateObject = new Date(data.time)
    return(
        <div  className=" text-white text-base w-[100%] h-auto mb-2 
        flex justify-start items-center">
            <div className="  w-[60%] ml-3 h-auto flex flex-col justify-betweeen items-start">
                <div className=" text-[.5rem] h-4 w-auto  flex justify-between items-center">
                    <p>
                        {dateObject.toDateString()}
                    </p>
                </div>
                <p className=" pt-1 pb-1 pl-2 pr-2  bg-orange-600 h-auto w-auto break-all 
                    left-box flex justify-center items-center" >
                    {data.content}
                </p>
            </div>
        </div>
    )
}