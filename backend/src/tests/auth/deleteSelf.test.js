import axios from 'axios'
import { describe, it, expect } from 'vitest'
import { handler as signup } from '../../auth/signup.js'
import { getBaseAPI, getStage } from '../../auth/_utils.js'

import { 
    isProd,
    baseAPI,
    session,
    correctPayload
} from './testingData.js'

if (isProd) {
    console.warn('⚠️ Tests are disabled in production stage.')
    process.exit(0)
}

describe('delete-self', async () => {
    it('should fail if access token is missing', async () => {
        try {
            await axios.post(`${baseAPI}/auth/delete-self`, correctPayload)
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toMatchObject({
                error: 'Access Token is required!'
            }) 
        }
    })

    it('should fail if access token is incorrect', async () => {
        try {
            await axios.post(`${baseAPI}/auth/delete-self`, {
                accessToken: `${session.accessToken}B@D`
            })
        } catch (err) {
            expect(err.response.status).toBe(400)
            expect(err.response.data).toHaveProperty('error') 
        }
    })

    it('should successfully delete a user', async () => {
        expect(session.accessToken).toBeTruthy()
        const response = await axios.post(`${baseAPI}/auth/delete-self`, {
            accessToken: session.accessToken
        })

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('message') 
        expect(response.data.message).toBe('You have successfully deleted your account!') 
    })
})