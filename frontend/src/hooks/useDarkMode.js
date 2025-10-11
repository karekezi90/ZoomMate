import { useEffect, useState } from 'react'

const LS_KEY = 'theme' // 'dark' | 'light'

const getPreferred = () => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
        return saved === 'dark'
    }
    return false
}

const useDarkMode = () => {
    const [enabled, setEnabled] = useState(getPreferred)

    // Apply/remove the .dark class on <html> and persist to localStorage
    useEffect(() => {
        const root = document.documentElement
        if (enabled) {
            root.classList.add('dark')
            localStorage.setItem(LS_KEY, 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem(LS_KEY, 'light')
        }
    }, [enabled])

    // If the user hasn't explicitly chosen a theme, follow OS changes live
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const saved = localStorage.getItem(LS_KEY)
        if (saved) {
            return
        } 

        const handler = (e) => setEnabled(e.matches)
        mq.addEventListener?.('change', handler)
        
        return () => mq.removeEventListener?.('change', handler)
    }, [])

    return [enabled, setEnabled]
}

export default useDarkMode