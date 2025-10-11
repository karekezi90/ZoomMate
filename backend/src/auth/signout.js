import { 
    GlobalSignOutCommand
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
        const cmd = new GlobalSignOutCommand({
            AccessToken: accessToken
        })
        await cognito.send(cmd)
        
        return json(200, {
            message: 'User signed out successfully'
        })
    } catch (error) {
        return toHttpError(error)
    }
}   