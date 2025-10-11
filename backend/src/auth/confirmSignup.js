import { 
    ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { 
    json, 
    cognito,
    parseBody, 
    toHttpError 
} from './_utils.js'


export const handler = async (event) => {
    const body = parseBody(event)
    if (!body) {
        return json(400, { error: 'Invalid JSON' })
    }

    const { email, code } = body
    if (!email || !code) {
        return json(400, { error: 'email and code are required' })
    }

    try {
        const cmd = new ConfirmSignUpCommand({
            ClientId: process.env.USER_POOL_CLIENT_ID,
            Username: email,
            ConfirmationCode: String(code),
        })
        await cognito.send(cmd)
        return json(200, { message: 'Email verified' })
    } catch (error) {
        return toHttpError(error)
    }
}

