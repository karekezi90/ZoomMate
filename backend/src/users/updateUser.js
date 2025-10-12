import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { 
    json, 
    dbDoc, 
    parseBody, 
    toHttpError, 
    getUserSub, 
    getAccessToken, 
    ALLOWED_FIELDS,
} from '../_utils.js'

const pickUpdatable = data => {
    const out = {}
    for (const key of ALLOWED_FIELDS) {
        if (key in data) out[key] = data[key]
    }
    return out
}

export const handler = async (event) => {
    const body = parseBody(event)
    if (!body) {
        return json(400, { error: 'Invalid JSON!' })
    }

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

        const patch = pickUpdatable(body)
        if (Object.keys(patch).length === 0) {
            return json(400, { error: 'No updatable fields provided' })
        }

        // Build dynamic UpdateExpression
        const nowIso = new Date().toISOString()
        const exprNames = { '#updatedAt': 'updatedAt', '#createdAt': 'createdAt' }
        const exprValues = { ':updatedAt': nowIso, ':now': nowIso }

        const setClauses = [
            '#updatedAt = :updatedAt',
            '#createdAt = if_not_exists(#createdAt, :now)'
        ]

        for (const [k, v] of Object.entries(patch)) {
            const nameKey = `#${k}`
            const valueKey = `:${k}`
            exprNames[nameKey] = k
            exprValues[valueKey] = v
            setClauses.push(`${nameKey} = ${valueKey}`)
        }

        const cmd = new UpdateCommand({
            TableName: tableName,
            Key: { userId: userSub },
            UpdateExpression: `SET ${setClauses.join(', ')}`,
            ExpressionAttributeNames: exprNames,
            ExpressionAttributeValues: exprValues,
            ReturnValues: 'ALL_NEW'
        })

        const result = await dbDoc.send(cmd)
        return json(200, { message: 'Profile updated', user: result.Attributes })
    } catch (error) {
        const name = error?.name || ''
        if (name === 'NotAuthorizedException') {
            return json(401, { error: 'Unauthorized request' })
        }
        return toHttpError(error)
    }
}
