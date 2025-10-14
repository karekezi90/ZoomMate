import axios from 'axios'

const baseURL = import.meta.env.VITE_BASE_API

export const apiClient = axios.create({
    baseURL: baseURL
})

export const authHeader = (accessToken) => ({
    headers: { Authorization: `Bearer ${accessToken}` }
})
