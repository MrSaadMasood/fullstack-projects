import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa6";

export default function NewGroupForm() {
  const [groupName, setGroupName] = useState('');
  const [ groupPicutre , setGroupPicture] = useState("/placeholder.png")
  const [ image , setImage ] = useState(null)
  const imageRef = useRef(null)

  const [friends, setFriends] = useState([]);
  const array =["aslamhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
    "asghat",
    "daddy",
    "mashood",
    "hamza",
    "ali",
    "arslan",
    "saeed",
    "hamza",
    "jameel",
] 
  const handleFileInputChange = (e) => {
    const imageFile = e.target.files[0];
    const url = URL.createObjectURL(imageFile)
    setGroupPicture(url)
    setImage(imageFile);

  };

  const handleAddRemoveButtonClick = (friend) => {
    const friendIndex = friends.findIndex((f) => f === friend);

    if (friendIndex !== -1) {
      const updatedFriends = [...friends];
      updatedFriends.splice(friendIndex, 1);
      setFriends(updatedFriends);
    } else {
      setFriends([...friends, friend]);
    }
  };

  const handleCancelClick = () => {
    // Add logic for cancel button
    console.log("Cancel button clicked");
  };

  const handleSubmitClick = () => {
    // Add logic for submit button
    console.log("Submit button clicked");
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

        {/* Friends list with add/remove buttons */}
        <div className="ml-4 overflow-y-scroll noScroll text-white mt-4 w-[20rem] sm:w-[29rem] h-[20rem] p-3 border-2 rounded-lg">
            {array.map((friend, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-2 border-b-2 border-gray-500 p-1"
            >
              <span className=" w-[80%] overflow-hidden">{friend}</span>
              <button
                className={`p-2 ${
                  friends.includes(friend)
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-700"
                } text-white rounded w-20`}
                onClick={() => handleAddRemoveButtonClick(friend)}
              >
                {friends.includes(friend) ? "Remove" : "Add"}
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
