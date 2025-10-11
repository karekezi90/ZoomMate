import { createContext, useContext, useMemo } from 'react'
import useDarkMode from '../hooks/useDarkMode'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
    const [dark, setDark] = useDarkMode()
    const value = useMemo(() => ({
        dark,
        setDark,
        toggle: () => setDark(v => !v),
        theme: dark ? 'dark' : 'light'
    }), [dark, setDark])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}
