import { FaCamera } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa"
import useInterceptor from "./hooks/useInterceptors";
import { MdDone } from "react-icons/md";
import { useRef, useState } from "react";
export default function Profile( { userData,  profilePictureUrl,  isUserChangedSetter }){
    const isBio = userData.bio ? userData.bio : "Hi there I am using ChatApe"
    const [ bio, setBio ] = useState(isBio)
    const [ profilePicture, setProfilePicture] = useState(profilePictureUrl)
    const [ isBioButtonClicked, setIsBioButtonClicked] = useState(false)
    const [ submitProfilePicture, setSubmitProfilePictureButton] = useState(false)
    const [ image, setImage ] = useState(null)
    const [text, setText ] = useState(bio)
    const axiosPrivate = useInterceptor()
    const pictureRef = useRef(null)
    function handleChange(e){
        setText(e.target.value)
    }

    async function handleSubmit(e){
        e.preventDefault()
        try {
            const response = await axiosPrivate.post("/user/change-bio", { bio : text})
            setBio(text)
            setIsBioButtonClicked(false)
            e.target.reset()
        } catch (error) {
           console.log("error occured while updating the bio", error) 
        }
    }

    function getProfilePicture(){
        pictureRef.current.click()
    }

    async function handleImageSubmission(){
        try {

            if(userData.profilePicture){
                try {
                    await axiosPrivate.delete(`/user/delete-previous-profile-picture/${userData.profilePicture}`)
                } catch (error) {
                    console.log("failed to delete the previous profile picture", error) 
                    return
                }
            }
            const formData = new FormData()
            formData.append("image", image)
            const response = await axiosPrivate.post("/user/add-profile-image", formData , {
                headers : {
                    "Content-Type" : "multipart/form-data"
                }, 
            })
            setSubmitProfilePictureButton(false)
            isUserChangedSetter(true)
        } catch (error) {
            console.log("error while saving the profile picture", error)    
        }
    }

    function handleImageChange(e){
        const image = e.target.files[0]
        const url = URL.createObjectURL(image)
        setImage(image)
        setProfilePicture(url)
        setSubmitProfilePictureButton(true)
    }

    return (
    <div className=" lg:ml-16 lg:w-full lg:h-screen">
        <div className="w-full bg-black text-white border-b-2 border-[#555555] h-16 flex justify-between items-center p-3 ">
            <h2>My Profile</h2>
            <div className=" w-[30%] sm:w-[20%] md:w-[16%] lg:w-[14%] xl:w-[10%] flex justify-between items-center">
                <div className=" h-10 w-10 rounded-full overflow-hidden">
                    <img src={profilePicture} alt="" width={"400px"} />
                </div>
                <h2>
                    {userData.fullName}
                </h2>
            </div>
        </div>
        <div className=" h-[95vh] lg:h-[100vh] text-white bg-black flex flex-col justify-center items-center">
            <div className=" sm:h-[15rem] relative">
                <div className=" bg-blue-500 h-44 w-44 sm:h-60 sm:w-60 rounded-full relative overflow-hidden">

                    <img src={profilePicture} alt="" width={"800px"} />
                    
                </div>
                {!submitProfilePicture && 
                    <button className=" absolute bottom-0 right-7 sm:right-10 flex justify-center items-center
                    h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-400" onClick={getProfilePicture}>
                        <FaCamera size={30} color="black" className=" h-6 sm:h-12" />
                    </button>
                }
                
                {submitProfilePicture &&
                    <button className=" absolute bottom-0 right-7 sm:right-10 flex justify-center items-center
                    h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-400" onClick={handleImageSubmission}>
                        <MdDone size={30} color="black" className=" h-6 sm:h-12" />
                    </button>
                }
                <input type="file" name="profilePicture" id="profilePicture" className=" hidden" onChange={handleImageChange}
                ref={pictureRef} />
            </div>
            
            <div className=" flex justify-between items-center h-16 w-24 sm:w-28 mt-3 sm:mt-5">
                <h3 className="text-3xl sm:text-4xl font-bold">Bio</h3>
                <button onClick={()=>setIsBioButtonClicked(true)} className=""> 
                <FaEdit size={30} />
                </button>
            </div>
            <div className=" bg-[#777777] relative w-60 sm:w-[25rem] h-auto rounded-lg text-center break-all p-2 sm:p-3 mt-3">
            {!isBioButtonClicked && 
                <p className=" md:text-lg">
                    {bio}
                </p>
            }
            {isBioButtonClicked &&
                <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center">
                    <input type="text" name="bio" id="bio" value={text} required onChange={handleChange}
                    className=" bg-[#777777] w-[100%] p-1" />
                    <input type="submit" value={"Submit"} className=" bg-[#303030] text-white p-2 rounded-md mt-3
                    cursor-pointer hover:bg-[#1b1a1a]" />
                </form>
            }
            </div>
            

        </div>
    </div>
    )
}