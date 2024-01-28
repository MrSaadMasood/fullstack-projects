import { useEffect, useState } from "react"
import GameForm from "./GameForm"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function HighScore({ time, id }){
    // whene the form is submitted a get request is made to the server to get all the previous players records
    const [ isFormSubmitted, setIsFormSubmitted] = useState(false)
    const [ records , setRecords] = useState(null)
    // to naviagte the user to the main page
    const navigate = useNavigate()
    function formSubmissionSetter(value){
        setIsFormSubmitted(value)
    }
    useEffect(()=>{
        if(isFormSubmitted){
            axios.get(`/upload/${id}/get-records`).then(res=>{
                setRecords(res.data.records)        
            }).catch(error=>{
                console.log("error occured while getting records", error)
            })
        }
    }, [ isFormSubmitted])
    return (
    <div>
        {!isFormSubmitted && <GameForm time={time} setFormSubmission={formSubmissionSetter} id={id} />}
        {isFormSubmitted && 
            <div className=" fixed top-[50%] left-[50%] center z-40 h-[25rem]  md:h-[40rem] md:w-[30rem] w-[20rem] 
                        bg-black border-4 rounded-lg flex flex-col justify-center items-center border-red-600 text-white">
                <p className=" text-white font-bold text-2xl md:text-4xl mb-3">
                            HighScores
                </p>
                <div className=" text-white md:font-bold w-[17rem] md:w-[25rem] h-[15rem] md:h-[25rem] flex flex-col 
                justify-start items-center 
                overflow-y-scroll noScroll ">
                    <div className="  w-[95%] h-8 md:h-12 flex justify-between items-center border-b border-white">
                        <p className=" font-bold">
                            Name
                        </p>
                        <p className=" font-bold">
                            Time
                        </p>
                    </div>
                    { records && records.map((item, index)=>{
                        return (
                        <div key={index} className="  w-[95%] h-8 md:h-12 flex justify-between items-center border-b border-white">
                            <p>
                                {item.name}
                            </p>
                            <p>
                                {item.time}
                            </p>
                        </div>
                        )
                    })

                    }
                </div>
                <button className=" bg-green-500 p-2 mt-2 rounded-md hover:bg-green-400"
                onClick={()=>navigate("/")}>Main Menu</button>
            </div>
        }
    </div>
    )
}