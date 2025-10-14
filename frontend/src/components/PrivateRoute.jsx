import { Navigate, useLocation } from 'react-router-dom'
import { areTokensExpired } from '../_utitls'
import { useSelector } from 'react-redux'

const PrivateRoute = ({ children }) => {
    const location = useLocation()
    
    const { authenticatedUserData } = useSelector(state => state.auth)
    if (!authenticatedUserData) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    const { issuedAt, expiresIn } = authenticatedUserData
    if (areTokensExpired(issuedAt, expiresIn)) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return children
}

export default PrivateRoute