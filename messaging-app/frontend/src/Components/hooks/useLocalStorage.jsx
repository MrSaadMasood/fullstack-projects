import { useState } from "react"

export default function useLocalStorage(){
    const [ value, setValue] = useState(null)

    const setItem = (key, value)=>{
        localStorage.setItem(key, JSON.stringify(value))
    }

    const getItem = (key)=>{
        const value = JSON.parse(localStorage.getItem(key))
        setValue(value)
        return value

    }

    const removeItem = (key)=>{
        localStorage.removeItem(key)
    }

    return { value ,setItem, getItem , removeItem}
}