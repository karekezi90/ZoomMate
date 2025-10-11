import { 
    DeleteUserCommand
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
        return json(400, { errr: 'Invalid JSON!' })
    }

    const { accessToken } = body
    if (!accessToken) {
        return json(400, { error: 'Access Token is required!' })
    }

    try {
        const cmd = new DeleteUserCommand({
            AccessToken: accessToken
        })
        await cognito.send(cmd)
        
        return json(200, {
            message: 'You have successfully deleted your account!'
        })
    } catch (error) {
        return toHttpError(error)
    }
}   