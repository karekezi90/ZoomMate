import { Navigate, useLocation } from 'react-router-dom'
import { areTokensExpired } from '../lib/validators'
import { useSelector } from 'react-redux'

const PrivateRoute = ({ children }) => {
    let isAuthedUser = false
    const { authenticatedUserData } = useSelector(state => state.auth)
    if (authenticatedUserData) {
        const { issuedAt, expiresIn } = authenticatedUserData
        isAuthedUser = areTokensExpired(issuedAt, expiresIn) ? false : true
    }
    const location = useLocation()

    if (!isAuthedUser) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }
    
    return children
}

export default PrivateRoute