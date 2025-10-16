import axios from 'axios'
import { describe, it, expect } from 'vitest'
import { 
    baseAPI,
    session,
    correctPayload
} from './testingData.js'

describe('signout', () => {
    it('should fail if access token is missing', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signout`, correctPayload)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'Access Token is required!'
            }) 
        }
    })

    it('should fail if access token is incorrect', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signout`, {
                accessToken: `${session.accessToken}B@D`
            })
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toHaveProperty('error') 
        }
    })

    it('should successfully sign out in a user', async () => {
        expect(session.accessToken).toBeTruthy()
        const response = await axios.post(`${baseAPI}/auth/signout`, {
            accessToken: session.accessToken
        })
        session.accessToken = null

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('message') 
        expect(response.data.message).toBe('User signed out successfully') 

        const res = await axios.post(`${baseAPI}/auth/signin`, correctPayload)
        session.accessToken = res.data.accessToken
    })
})


