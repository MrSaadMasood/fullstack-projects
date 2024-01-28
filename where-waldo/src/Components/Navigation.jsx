import { useEffect, useRef, useState } from "react"
import { FaGamepad } from "react-icons/fa";

export default function Navigation({ buttonClicked, setButtonClicked, isGamecompleted, timeSetter}){
    // a timer to calculate the time taken by the user to complete the game
    // if the game is completed the timer stop and set the time state which is then used to make the records
    const timeref = useRef()
    const [totalSeconds, setTotalSeconds] = useState(0)
    const [ minutes , setMinutes] = useState(0)
    const [ hours, setHours] = useState(0)
    useEffect(()=>{
        if(! isGamecompleted){
        timeref.current = setInterval(() => {
            if(totalSeconds  > 58){
                if(minutes > 58){
                    setHours(hours + 1)           
                    setMinutes(0)
                    setTotalSeconds(0)
                    return
                }
                setMinutes(minutes + 1)
                setTotalSeconds(0)
                return
            }
            setTotalSeconds(totalSeconds + 1)

        }, 1000)
        return ()=> clearInterval(timeref.current)
    }
    if(isGamecompleted){
        const h = hours < 10 ? `0${hours}` : hours
        const m = minutes < 10 ? `0${minutes}` : minutes
        const s = totalSeconds < 10 ? `0${totalSeconds}` : totalSeconds
        timeSetter(`${h}:${m}:${s}`)
    }
    },[totalSeconds, minutes])
    return (

        <div className=" w-full h-14 sm:h-16 xl:h-20 bg-black font-bold text-white" onClick={()=>{
            if(buttonClicked) setButtonClicked()
        }}>
            <div className="absolute top-4 sm:top-5 xl:top-6 left-3 md:left-4 lg:left-5 xl:left-7 ">
                <img src="/logo.png" alt="gameLogo" width={"35px"} className=" xl:w-[50px]" />
            </div>
            <div className=" absolute top-4 sm:top-5 xl:top-7 left-[43%] md:left-[45%] lg:left-[47%] 
             lg:text-xl flex justify-center items-center">
                <p>{hours < 10 ? `0${hours}` : hours}</p>
                <p>:</p>
                <p>{minutes < 10 ? `0${minutes}` : minutes}</p>
                <p>:</p>
                <p>{totalSeconds < 10 ? `0${totalSeconds}` : totalSeconds}</p>
            </div>
            {!buttonClicked &&

            <button className=" w-24 md:w-28 lg:w-36 absolute top-4 sm:top-5 xl:top-7 lg:text-xl right-2 
            sm:right-4 lg:right-5 xl:right-7 
            flex justify-between
             items-center"
            onClick={setButtonClicked}>
                Characters {<FaGamepad size={30} />}
            </button>
            }
        </div>
    )
}