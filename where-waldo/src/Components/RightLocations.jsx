export default function RightLocations({ locations, divHeight}){
    return(
        <div>
            {locations.map((location, index)=>{
                return <div key={index} style={ { 
                top : `${(location.y * divHeight) - 40}px`,
                left : `${(location.x * window.innerWidth)- 40}px`
            }} 
            className={` bg-green-400 border-4 opacity-60 absolute border-green-700 z-40 w-20 h-20 rounded-full`}>
                
            </div>
            })}
        </div>
    ) }