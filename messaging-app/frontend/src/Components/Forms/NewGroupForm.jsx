import { useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import useInterceptor from "../hooks/useInterceptors";

export default function NewGroupForm() {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState("");
  const [ groupPicutre , setGroupPicture] = useState("/placeholder.png")
  const [ image , setImage ] = useState(null)
  const [ friendsIncluded, setFriendsIncluded] = useState([]);
  const [ errorDiv, setErrorDiv] = useState(false)
  const [ errorMessage , setErrorMessage] = useState("")
  const [friendList , setFriendList ]  = useState([])
  const axiosPrivate = useInterceptor()
  const imageRef = useRef(null)
  
  useEffect(()=>{
    async function getAllFriendsData(){
        try {
            const response = await axiosPrivate.get(`/user/get-friends-data`)
            console.log(response)
            setFriendList(response.data.friendsData)
        } catch (error) {
            console.log("error occured while gettign the friends Data", error)            
        }
    }
    
    getAllFriendsData()

  },[axiosPrivate])

  useEffect(()=>{
    if(errorDiv){
        const timer = setTimeout(() => {
            setErrorDiv(false)
        }, 2000);
        return ()=> clearTimeout(timer)
    }

  },[errorDiv])
  
  const handleFileInputChange = (e) => {
    const imageFile = e.target.files[0];
    const url = URL.createObjectURL(imageFile)
    setGroupPicture(url)
    setImage(imageFile);

  };

  const handleAddRemoveButtonClick = (friend) => {
    const friendIndex = friendsIncluded.findIndex((f) => f === friend);

    if (friendIndex !== -1) {
      const updatedFriends = [... friendsIncluded];
      updatedFriends.splice(friendIndex, 1);
      setFriendsIncluded(updatedFriends);
    } else {
      setFriendsIncluded([... friendsIncluded, friend]);
    }
  };

  const handleCancelClick = () => {
    navigate("/")
  };

  const handleSubmitClick = async () => {
    if(groupName === ""){
        setErrorDiv(true)
        return setErrorMessage("Group Name must be provided")
    }

    if(friendsIncluded.length < 2){
        setErrorDiv(true)
        return setErrorMessage("The Group must have atleast 2 Members")
    }
    const formData = new FormData()
    formData.append("image", image)
    formData.append("groupName", groupName)
    formData.append("members", JSON.stringify(friendsIncluded))
    try {
        const respone = await axiosPrivate.post("/user/create-new-group", formData, {
            headers : {
                "Content-Type" : "multipart/form-data"
            }
        })
    } catch (error) {
        console.log("error occured while creating a new form", error)
    }
    console.log("the form data is ", Object.fromEntries(formData))
  };


  return (
    <div>
      <div className="absolute bg-black flex flex-col justify-center items-center h-screen w-screen">
        {/* Circular group image and file input */}
        <div className=" relative">
          <div className="relative w-44 h-44 rounded-full overflow-hidden">
            <img src={groupPicutre} alt="" width={"300px"} />
            <input
              type="file"
              id="image"
              name="image"
              className="hidden"
              onChange={handleFileInputChange}
              ref={imageRef}
            />
          </div>
          <button
            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 h-12 w-12 flex justify-center items-center 
            rounded-full"
            onClick={() => imageRef.current.click()}
          >
                <FaCamera size={30} color="black" className=" h-6 sm:h-12" />
          </button>
        </div>

        {/* Group name field */}
        <input
          type="text"
          className="ml-4 mt-4 p-2 border border-gray-300 rounded-md w-72"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
        {errorDiv && 
            <div 
            className=" flex justify-center items-center mt-3 text-white bg-red-600 w-[40%] h-8 rounded-md "
            >
                {errorMessage}
            </div>
        }
        

        {/* Friends list with add/remove buttons */}
        <div className="ml-4 overflow-y-scroll noScroll text-white mt-4 w-[20rem] sm:w-[29rem] h-[20rem] p-3 border-2 rounded-lg">
            {friendList.map((friend, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-2 border-b-2 border-gray-500 p-1"
            >
              <span className=" w-[80%] overflow-hidden">{friend.fullName}</span>
              <button
                className={`p-2 ${
                   friendsIncluded.includes(friend._id)
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-700"
                } text-white rounded w-20`}
                onClick={() => handleAddRemoveButtonClick(friend._id)}
              >
                { friendsIncluded.includes(friend._id) ? "Remove" : "Add"}
              </button>
            </div>
          ))}
        </div>

        {/* Submit and Cancel buttons */}
        <div className="mt-4 flex w-44 justify-between items-center">
            <button
            className="bg-red-500 hover:bg-red-600 text-white p-2 w-20 rounded-md"
            onClick={handleCancelClick}
            >
            Cancel
            </button>
            <button
            className="bg-gray-500 hover:bg-gray-600 text-white p-2 w-20 rounded-md"
            onClick={handleSubmitClick}
            >
            Submit
            </button>
          
        </div>
        
      </div>
    </div>
  );
}
