import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      try {
        const valueToStore = value instanceof Function ? value(prev) : value
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        return valueToStore
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
        return prev
      }
    })
  }, [key])

  return [storedValue, setValue]
}
