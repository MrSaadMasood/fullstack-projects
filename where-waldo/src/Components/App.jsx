import { useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";
import Menu from "./Menu";
import SideBar from "./SideBar";
import WrongSelection from "./WrongSelection";
import axios from "axios"
import RightLocations from "./RightLocations";
import { useNavigate, useParams } from "react-router-dom";
import RightSelection from "./RightSelection";
import HighScore from "./HighScores";
export default function App() {

    const imageRef = useRef(null)
    // postion state give the position in pixels used for mouse position by adding the scroll
    const [ position , setPosition] = useState({ x : 0 , y : 0})
    // to get the ratio of x and y coordinates that that are normalized across screens
    const [ positionRatio, setPositionRatio ] = useState({ x : 0 , y : 0 })
    // to know if the click on the image is first one or is it already clicked
    const [ isImageClicked , setIsImageClicked] = useState(false)
    const [ navCharButton , setNavCharButton ] = useState(false)
    const [ wrongAreaSelected, setWrongAreaSelected] = useState(false)
    const [ selectCharacter , setSelectedCharacter] = useState(null)
    const [ mainGameImage , setMainGameImage ] = useState(null)
    const [ charactersData, setCharactersData] = useState(null)
    const [ charactersFound, setCharactersFound] = useState([])
    const [ realLocations, setRealLocations] = useState([])
    // this when multiplied with the normalized y ratio will give us the exact position of the character
    const [ imageDivElememtHeight , setImageDivElementHeight] = useState(0)
    const [ isGamecompleted, setIsGameCompleted] = useState(false)
    const [isRightCharacterSelected, setIsRightCharacterSelected] = useState(false)
    const navigate = useNavigate()
    const [ time, setTime ] = useState("")
    const { id } = useParams()

    const heightWidth = navCharButton? " h-[25rem] md:h-[29rem] w-[15rem] md:w-[18rem] lg:w-[22rem] xl-w-[25rem] " : "h-0 w-0"
    const selectionMenu = isImageClicked ? "h-auto" : " h-0 w-0"
    // fetching the main game image first then fetching the characters to find. if error navigated to the error page
    useEffect(()=>{
        async function getGameData(){
         try {
            const mainImage = await axios.get(`/upload/${id}`)
            setMainGameImage(mainImage.data)
            const charImages = await axios.get(`/upload/${id}/characters-data`)
            setCharactersData(charImages.data.data)
         } catch (error) {
            console.log("some error occured while getting data")
            navigate("*")
         }   
        }
        getGameData()
    },[])

    // the element referenced is used to get the various measurements 
    useEffect(()=>{

        const element = imageRef.current
        const bounding = element.getBoundingClientRect()
        const coordinates = (e)=>{
            // t is the position of the element inside the image div used for normalization of coordinates
            const t = e.pageY - bounding.y
            const start = bounding.y
            const end = bounding.bottom
            const horizontalRatio = (e.clientX - bounding.x) / window.innerWidth
            // the position inside the image is divided by the total height of the div to get the ratio
            const verticalRatio = t / (end - start)
            setImageDivElementHeight(end - start)
            setPosition({
                x : (e.clientX - bounding.x ) ,
                y : Math.round(e.clientY - bounding.y + window.scrollY)

            })
            if(isImageClicked) return 
            setPositionRatio({
                x : horizontalRatio,
                y : verticalRatio
            })
        }

        const timer = setTimeout(() => {
            element.addEventListener("click", coordinates)
        }, 3000);
    
        return ()=> {
            element.removeEventListener("click", coordinates)
            clearTimeout(timer)
        }
    },[mainGameImage])

    // for checking if the all characters have been found 
    useEffect(()=>{
        if(charactersFound.length > 0 && charactersData && charactersFound.length === charactersData.length){
            setIsGameCompleted(true)
        }
    })
    
    // if the wrong character selected div is active it deactivates it
    useEffect(()=>{
        if(wrongAreaSelected){
            const timer = setTimeout(() => {
                setWrongAreaSelected(false)
            }, 2000);

            return ()=> clearTimeout(timer)
        }
    },[wrongAreaSelected])

    // same as above but for the right character div
    useEffect(()=>{
        if(isRightCharacterSelected){
            const timer = setTimeout(() => {
                setIsRightCharacterSelected(false)
            }, 2000);

            return ()=> clearTimeout(timer)
        }
    },[isRightCharacterSelected])

    function navCharButtonSetter(){
        setNavCharButton(!navCharButton)
    }

    // if a character is selected a get request is sent to the backend server to verify the location of that character
    function characterSelected(charId, name){
        setSelectedCharacter(name)
        axios.get(`/upload/${id}/check-location?charId=${charId}&x=${positionRatio.x}&y=${positionRatio.y}`)
        .then(res=>{
            setRealLocations((realLocations)=>{
                const oldLocations = [ ...realLocations ]
                oldLocations.push(res.data.location)
                return oldLocations
            });
            setCharactersFound((preCharactersFound)=>{
                const array = [...preCharactersFound]
                array.push(name)
                return array
            })
            setIsRightCharacterSelected(true)
        }).catch(error=>{
            setWrongAreaSelected(true)
        })
        setIsImageClicked(false)
    }
    // used to keep the record of if the image is clicked
    function tellifclicked(){
        if(navCharButton){
            return setNavCharButton()
        }
        setIsImageClicked(!isImageClicked)
    }

    function timeSetter(time){
        setTime(time)
    }

    return (
    <div className="relative bg-black h-auto">
        {isGamecompleted && 
            <div className="fixed top-0 left-0 w-[100%] h-[100%] bg-black opacity-60 z-30"></div>
        }
        {isGamecompleted &&
            <HighScore time={time} id={id} />
        }
        <Navigation buttonClicked={navCharButton} setButtonClicked={navCharButtonSetter} isGamecompleted={isGamecompleted}
        timeSetter={timeSetter} />
        <div ref={imageRef} className="relative" onClick={tellifclicked}>
            {isImageClicked && 
            <div>
                <div style={ { 
                    top : `${position.y - 40}px`,
                    left : `${position.x - 40}px`
                }} 
                className={` bg-yellow-400 opacity-60 border-4 border-yellow-700 absolute w-20 h-20 rounded-full`}>

                </div>
            </div>}

            <RightLocations locations={realLocations} divHeight={imageDivElememtHeight} />
            {mainGameImage && 
                <img src={`data:image/jpeg;base64,${mainGameImage}`} alt="gameImage" />
            }
        </div>
        <SideBar heightWidth={heightWidth} characters={charactersData} />
        {wrongAreaSelected && 
           <WrongSelection character={selectCharacter} /> 
        }
        {isRightCharacterSelected &&
            <RightSelection character={selectCharacter} />
        }
        {isImageClicked && <Menu positionRatio={positionRatio} position={position} array={charactersData} 
        menuHeightWidth={selectionMenu}
        characterSelected={characterSelected} charactersFound={charactersFound} /> }

    </div>
    )
  }