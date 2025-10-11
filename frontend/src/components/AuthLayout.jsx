import ThemeToggle from './ThemeToggle'
import bgLight from '../assets/bg-lady.png'
import bgDark from '../assets/bg-lady-dark.png'
import lightLogo from '../assets/zoommate-wordmark.svg'
import darkLogo from '../assets/zoommate-wordmark-dark.svg'
import { useTheme } from '../context/ThemeContext'

const AuthLayout = ({ title, subtitle, children }) => {
    const { dark } = useTheme()
    const bg = dark ? bgDark : bgLight
    const logo = dark ? darkLogo : lightLogo

    return (
        <div className='min-h-screen grid md:grid-cols-2'>
            <div className='order-2 md:order-1 h-full flex flex-col justify-center dark:bg-gray-900'>
                <div className='mx-auto mb-4 flex justify-end'>
                    <ThemeToggle />
                </div>
                <img src={logo} alt='ZoomMate Logo' className='mx-auto w-[26rem]'/>
                <div className='card mx-auto max-w-md p-6'>
                    <h1 className='text-2xl font-semibold dark:text-white-900 light:text-gray-900'>{title}</h1>
                        {subtitle && <p className='mt-1 text-sm dark:text-white-600 light:text-gray-600'>{subtitle}</p>}
                    <div className='mt-6'>{children}</div>
                </div>
                <p className='mt-6 text-center text-xs light:text-gray-500 dark:text-white-500'>By continuing, you agree to our Terms and Privacy Policy.</p>
            </div>

            <div className='order-1 hidden md:block h-full bg-cover bg-center' style={{ backgroundImage: `url(${bg})` }}>
            </div>
        </div>
    )
}

export default AuthLayout

