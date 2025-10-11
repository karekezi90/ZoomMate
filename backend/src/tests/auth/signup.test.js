import axios from 'axios'
import { describe, it, expect } from 'vitest'
import { 
    isProd,
    baseAPI,
    correctPayload, 
    payloadWithoutEmail,
    payloadWithInvalidEmail,
    payloadWithInvalidPassword,
} from './testingData.js'

if (isProd) {
    console.warn('⚠️ Tests are disabled in production stage.')
    process.exit(0)
}

describe('signup and confirm', () => {
    it('should successfully sign up a new user', async () => {
        const response = await axios.post(`${baseAPI}/auth/signup`, correctPayload)

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('userSub') 
    })

    it('should fail if password is invalid', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signup`, payloadWithInvalidPassword)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'Password does not meet policy'
            }) 
        }
    })

    it('should fail if email is invalid', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signup`, payloadWithInvalidEmail)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'Invalid email address format.'
            }) 
        }
    })

    it('should fail if password is missing', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signup`, payloadWithoutEmail)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'email and password are required'
            }) 
        }
    })

    it('should fail if email is missing', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signup`, payloadWithoutEmail)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'email and password are required'
            }) 
        }
    })

    it('should fail if a user already exists', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signup`, correctPayload)
        } catch (err) {
            expect(err.response.status).toBe(409)
            expect(err.response.data).toMatchObject({
                error: 'User already exists'
            }) 
        }
    })

    it('should confirm the user', async () => {
        const response = await axios.post(`${baseAPI}/auth/confirm-admin`, { email: correctPayload.email })
        expect(response.status).toBe(200)
        expect(response.data.message).toBe('Confirmed')
    })
})



