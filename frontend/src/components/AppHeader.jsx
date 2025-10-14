import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ThemeToggle from './ThemeToggle'
import lightLogo from '../assets/zoommate-logo-aligned.svg'
import darkLogo from '../assets/zoommate-logo-dark-aligned.svg'
import { useTheme } from '../context/ThemeContext'
import { logout, resetAuth } from '../features/auth/authSlice'
import { useEffect } from 'react'

const AppHeader = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { authenticatedUserData, logoutStatus } = useSelector(state => state.auth)
    const { dark } = useTheme()
    const logo = dark ? darkLogo : lightLogo
    

    useEffect(() => {
        if (logoutStatus === 'succeeded') {
            dispatch(resetAuth())
        }
    }, [logoutStatus])

    const handleLogout = () => {
        dispatch(logout())
    }

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
                        Profile
                    </Link>
                    <Link 
                        to='/account' 
                        className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    >
                        Account Settings
                    </Link>
                </nav>

                {/* Right: theme toggle + user */}
                <div className='flex items-center gap-3'>
                    <ThemeToggle />
                    {authenticatedUserData && (
                            <button
                                onClick={handleLogout}
                                className='btn-muted h-9 px-3'
                            >
                                {logoutStatus === 'loading' ? 'Signing out...' : 'Sign out'}
                            </button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AppHeader