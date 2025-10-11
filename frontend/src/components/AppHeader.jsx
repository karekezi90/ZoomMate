import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { getSession, logout } from '../lib/auth'
import lightLogo from '../assets/zoommate-logo-aligned.svg'
import darkLogo from '../assets/zoommate-logo-dark-aligned.svg'
import { useTheme } from '../context/ThemeContext'

const AppHeader = () => {
    const { dark } = useTheme()
    const logo = dark ? darkLogo : lightLogo
    
    const session = getSession()
    const nav = useNavigate()
    const email = session?.email

    return (
        <header className='sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900'>
            <div className='mx-auto flex h-30 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
                {/* Left: logo + brand */}
                <Link to='/profile' className='flex items-center gap-2'>
                    <img src={logo} alt='ZoomMate Logo' className='w-[20rem] mt-2'/>
                </Link>

                {/* Center: nav */}
                <nav className='hidden gap-6 text-sm sm:flex'>
                    <Link 
                        to='/profile' 
                        className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    >
                        Home
                    </Link>
                    <Link 
                        to='/account' 
                        className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    >
                        Account
                    </Link>
                    <Link to='/meetings' className='text-gray-400 pointer-events-none'> 
                        Meetings (soon)
                    </Link>
                </nav>

                {/* Right: theme toggle + user */}
                <div className='flex items-center gap-3'>
                    <ThemeToggle />
                    {email && (
                        <>
                            <span className='hidden text-xs text-gray-500 sm:inline'>{email}</span>
                            <button
                                onClick={()=>{ 
                                    logout()
                                    nav('/login', { replace: true })
                                }}
                                className='btn-muted h-9 px-3'
                            >
                                Sign out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AppHeader