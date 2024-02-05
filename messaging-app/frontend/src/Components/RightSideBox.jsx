export default function RightSideBox({ data }){
    return(
    <div className=" text-white text-base w-[100%] h-auto mb-2 
    flex justify-end items-center">
        <div className="  w-[60%] mr-3 h-auto flex flex-col justify-betweeen items-end">
            <div className=" text-[.5rem] h-4 w-14 flex justify-around items-center">
                <p>
                    Mon
                </p>
                <p>
                    7:25A.M
                </p>
            </div>
            <p className=" pt-1 pb-1 pl-2 pr-2  bg-orange-600 h-auto w-auto break-all 
                 right-box flex justify-center items-center" >
                {data.content}
            </p>
        </div>
    </div>
    )
}