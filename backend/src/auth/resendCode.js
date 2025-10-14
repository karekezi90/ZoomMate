import { 
    ResendConfirmationCodeCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { 
    json, 
    cognito,
    parseBody, 
    toHttpError 
} from '../_utils.js'

export const handler = async (event) => {
    const body = parseBody(event)
    if (!body) {
        return json(400, { error: 'Invalid JSON' })
    }

    const { email } = body
    if (!email) {
        return json(400, { error: 'email is required' })
    }

    try {
        const cmd = new ResendConfirmationCodeCommand({
            ClientId: process.env.USER_POOL_CLIENT_ID,
            Username: email,
        })
        const res = await cognito.send(cmd)
        
        return json(200, {
            message: 'Confirmation code resent',
            delivery: res.CodeDeliveryDetails,
        })
    } catch (err) {
        return toHttpError(err)
    }
}

