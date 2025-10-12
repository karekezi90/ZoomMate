import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { json, dbDoc, toHttpError, getUserSub, getAccessToken } from '../_utils.js'

export const handler = async (event) => {
    const accessToken = getAccessToken(event) 
    if (!accessToken) {
        return json(400, { error: 'Access Token is required!' })
    }

    const tableName = process.env.USERS_TABLE
    if (!tableName) {
        return json(500, { error: 'Server misconfiguration: USERS_TABLE not set' })
    }

    try {
        const userSub = await getUserSub(accessToken)
        if (!userSub) {
            return json(401, { error: 'Unable to resolve user id (sub) from token' })
        }

        const result = await dbDoc.send(new GetCommand({
            TableName: tableName,
            Key: { userId: userSub }
        }))

        if (!result.Item) {
            return json(404, { error: 'User profile not found' })
        }

        return json(200, { user: result.Item })
    } catch (error) {
        const name = error?.name || ''
        if (name === 'NotAuthorizedException') {
            return json(401, { error: 'Unauthorized request' })
        }
        return toHttpError(error)
    }
}
