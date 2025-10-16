import { 
    GetUserCommand,
    DeleteUserCommand
} from '@aws-sdk/client-cognito-identity-provider'
import {
  DynamoDBClient,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb'
import { 
    json, 
    cognito,
    parseBody, 
    toHttpError,
    purgeUserGroupsAndMemberships
} from '../_utils.js'

const ddb = new DynamoDBClient({})

export const handler = async (event) => {
    const body = parseBody(event)
    if (!body) {
        return json(400, { errr: 'Invalid JSON!' })
    }

    const { accessToken } = body
    if (!accessToken) {
        return json(400, { error: 'Access Token is required!' })
    }

    const tableName = process.env.USERS_TABLE
    if (!tableName) {
        return json(500, { error: 'Server misconfiguration: USERS_TABLE not set' })
    }

    try {
        // Get the user’s sub (unique id) from Cognito using the access token
        const getUserRes = await cognito.send(new GetUserCommand({ AccessToken: accessToken }))
        const subAttr = getUserRes.UserAttributes?.find(a => a.Name === 'sub')
        const userSub = subAttr?.Value || getUserRes.Username

        if (!userSub) {
            return json(401, { error: 'Unable to resolve user id (sub) from token' })
        }

        // Purge all groups owned by the user and all memberships where user is a member
        await purgeUserGroupsAndMemberships(userSub)

        // Delete the item from DynamoDB where PK is userId = sub
        await ddb.send(new DeleteItemCommand({
            TableName: tableName,
            Key: { userId: { S: userSub } }
        }))

        // Delete the Cognito user associated with the provided access token
        const cmd = new DeleteUserCommand({
            AccessToken: accessToken
        })
        await cognito.send(cmd)
        
        return json(200, {
            message: 'You have successfully deleted your account and profile data.'
        })
    } catch (error) {
        return toHttpError(error)
    }
}   