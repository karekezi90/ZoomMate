import { apiClient,  authHeader} from '../apiClient'

const USERS_PATH = '/users'

const getUser = async (accessToken) => {
    return await apiClient.get(`${USERS_PATH}/me`, authHeader(accessToken))
}

const getUsers = async (accessToken, params = { limit: 200 }) => {
    return await apiClient.get(USERS_PATH, { ...authHeader(accessToken), params })
}
const updateUser = async (accessToken, payload) => {
    return await apiClient.put(`${USERS_PATH}/me`, payload, authHeader(accessToken))
}

const searchUsers = async (accessToken, payload, params = {}) => {
    return await apiClient.post(USERS_PATH, payload, { ...authHeader(accessToken), params })
}

const userService = {
    getUser,
    getUsers,
    updateUser,
    searchUsers
}

export default userService 