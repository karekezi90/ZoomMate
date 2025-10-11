import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import VerifyCode from './pages/VerifyCode'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Account from './pages/Account'
import PrivateRoute from './components/PrivateRoute'
import ProtectedLayout from './components/ProtectedLayout'

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<VerifyCode />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
                element={
                <PrivateRoute>
                    <ProtectedLayout />
                </PrivateRoute>
                }
            >
                <Route path="/profile" element={<Profile />} />
                <Route path="/account" element={<Account />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App