import apiClient from "../apiClient"

const LOGIN_PATH = '/auth/signin'
const SIGNUP_PATH = '/auth/signup'
const LOGOUT_PATH = '/auth/signout'
const CONFIRM_PATH = '/auth/confirm'
const RESEND_PATH = '/auth/resend'
const DELETE_SELF_PATH = '/auth/delete-self'

const signup = async (payload) => {
    return await apiClient.post(SIGNUP_PATH, payload)
}

const confirm = async (payload) => {
    return await apiClient.post(CONFIRM_PATH, payload)
}

const resendCode = async (payload) => {
    return await apiClient.post(RESEND_PATH, payload)
}

const login = async (payload) => {
    return await apiClient.post(LOGIN_PATH, payload)
}

const deleteSelf = async (payload) => {
    return await apiClient.post(DELETE_SELF_PATH, payload)
}

const logout = async (payload) => {
    return await apiClient.post(LOGOUT_PATH, payload)
}

const authService = {
    login,
    signup,
    logout,
    confirm,
    resendCode,
    deleteSelf
}

export default authService 