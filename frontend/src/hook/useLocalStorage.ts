import { useState } from 'react';

const useLocalStorage = <S>(key: string, defaultValue: S) => {
  const [storedValue, setStoredValue] = useState(() => {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : defaultValue
  })

  const setValue = (value: S) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    if (valueToStore) {
      // value to store -> add to local storage
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } else {
      // no value to store -> remove from local storage
      localStorage.removeItem(key)
    }
    setStoredValue(valueToStore)
  }

  return [storedValue, setValue]
}

export default useLocalStorage
