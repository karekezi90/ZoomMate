import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'

const ProtectedLayout = () => {
    return (
        <div className='min-h-screen'>
            <AppHeader />
            <main className='pb-10 pt-6 dark:bg-gray-800'>
                <Outlet />
            </main>
        </div>
    )
}

export default ProtectedLayout