import axios from "axios"

export default function GameForm({ time, setFormSubmission, id }){
    // handles the form submission and to add the record in the database
    function submitForm(e){
        e.preventDefault()
        const name = e.target.elements.name.value
        axios.post(`/upload/${id}/save-record`, { name : name, time : time}).then(res=>{
            setFormSubmission(true)
        }).catch(error=>{
            console.log("some error occured", error);
            setFormSubmission(false)
        })
    }
    return (
        <div className=" fixed top-[50%] left-[50%] center z-40 h-[25rem]  md:h-[40rem] md:w-[30rem] w-[20rem] 
                        bg-black border-4 rounded-lg flex flex-col justify-center items-center border-red-600 text-white">
            <p className=" text-white font-bold text-2xl md:text-4xl ">
                HighScores
            </p>
            <p className=" text-base">
                {time && time}
            </p>
            <p className=" text-sm">
                Add your own Score!
            </p>
            <form onSubmit={(e)=>submitForm(e)} className=" h-20 w-auto flex mt-1
                flex-col justify-around items-center" >
                <input type="text" placeholder="Enter Your Name Here" name="name" id="name" required
                    className="text-black rounded-lg p-1" />
                <hr />
                <input type="submit" value="Submit" className=" bg-blue-600 hover:bg-blue-300 rounded-xl h-8 w-16" />    
            </form>   
        </div>
    )
}