export default function SideBar({ heightWidth, characters}){
    return(

            <div className={`${heightWidth} bg-black text-white ease-in duration-200 absolute z-10 rounded-2xl
                top-5 right-0 overflow-hidden flex flex-col justify-center items-center`} >
                    {characters && characters.map((character,item)=>{
                        return (
                            <div key={item} className=" w-[90%] h-32 p-3 flex justify-between items-center cursor-pointer">
                                <div className="font-bold">{character.name}</div>
                                <div className="">
                                    <img src={`data:image/jpg;base64,${character.image}`} alt="" width={'90px'} />
                                </div>
                            </div>
                        ) 
                    })}
            </div>
    )
}