import axios from 'axios'
import { describe, it, expect } from 'vitest'
import { handler as signup } from '../../auth/signup.js'
import { getBaseAPI, getStage } from '../../auth/_utils.js'

import { 
    isProd,
    baseAPI,
    session,
    correctPayload, 
    payloadWithoutEmail,
    payloadWithoutPassword,
    payloadWithInvalidEmail,
    payloadWithInvalidPassword,
} from './testingData.js'

if (isProd) {
    console.warn('⚠️ Tests are disabled in production stage.')
    process.exit(0)
}

describe('singin', () => {
    it('should successfully sign in a user', async () => {
        const response = await axios.post(`${baseAPI}/auth/signin`, correctPayload)

        session.userExists = true
        session.isAuthenticated = true
        session.accessToken = response.data.accessToken

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('accessToken') 
        expect(response.data).toHaveProperty('refreshToken') 
        expect(response.data).toHaveProperty('idToken') 
    })

    it('should fail if password is incorrect', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signin`, payloadWithInvalidPassword)
        } catch (err) {
            expect(err.response.status).toBe(401)
            expect(err.response.data).toMatchObject({
                error: 'Incorrect username or password'
            }) 
        }
    })

    it('should fail if email is incorrect', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signin`, payloadWithInvalidEmail)
        } catch (err) {
            expect(err.response.status).toBe(401)
            expect(err.response.data).toMatchObject({
                error: 'Incorrect username or password'
            }) 
        }
    })

    it('should fail if password is missing', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signin`, payloadWithoutPassword)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'email and password are required'
            }) 
        }
    })

    it('should fail if email is missing', async () => {
        try {
            await axios.post(`${baseAPI}/auth/signin`, payloadWithoutEmail)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'email and password are required'
            }) 
        }
    })
})

