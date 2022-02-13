import {useState} from "react";

const useLocalStorage = <S>(key: string, defaultValue: S) => {
    const [storedValue, setStoredValue] = useState(() => {
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : defaultValue
    })

    const setValue = (value: S) => {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        localStorage.setItem(key, JSON.stringify(valueToStore))
    }

    return [storedValue, setValue]
}

export default useLocalStorage
