export default function WrongSelection({ character }){

    return(
        <div className={`center bg-red-500 flex justify-center p-2 items-center fixed bottom-3 left-[50%] w-[25rem] h-10
         rounded-md `}>
            <p>
                {character} does not seem to be there
            </p>
        </div>
    )
}