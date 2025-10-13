import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { json, dbDoc, parseBody, toHttpError, getUserSubFromAuth } from '../_utils.js'

export const handler = async (event) => {
    const me = await getUserSubFromAuth(event)
    if (!me) {
        return json(401, { error: 'Unauthorized' })
    }

    const tableName = process.env.GROUPS_TABLE
    if (!tableName) {
        return json(500, { error: 'GROUPS_TABLE not set' })
    }

    const groupId = event?.pathParameters?.groupId
    if (!groupId) {
        return json(400, { error: 'groupId is required' })
    }

    const body = parseBody(event)
    if (!body) {
        return json(400, { error: 'Invalid JSON' })
    }

    const patch = {}
    if (body.name !== undefined) {
        if (!body.name || String(body.name).trim().length < 3) {
            return json(400, { error: 'name must be at least 3 chars' })
        }
        patch.name = String(body.name).trim()
    }

    if (body.description !== undefined) {
        patch.description = String(body.description || '').trim()
    }
    if (body.tags !== undefined) {
        if (!Array.isArray(body.tags)) {
            return json(400, { error: 'tags must be an array' })
        }
        patch.tags = body.tags
    }

    if (Object.keys(patch).length === 0) {
        return json(400, { error: 'No updatable fields provided' })
    }

    try {
        // fetch to verify owner
        const current = await dbDoc.send(new GetCommand({ 
            TableName: tableName, 
            Key: { groupId }
        }))
        if (!current.Item) {
            return json(404, { error: 'Group not found' })
        }
        if (current.Item.ownerId !== me) {
            return json(403, { error: 'Forbidden: only owner can update' })
        }

        // dynamic SET
        const now = new Date().toISOString()
        const names = { '#updatedAt': 'updatedAt' }
        const values = { ':updatedAt': now }
        const sets = ['#updatedAt = :updatedAt']

        for (const [k, v] of Object.entries(patch)) {
            names[`#${k}`] = k
            values[`:${k}`] = v
            sets.push(`#${k} = :${k}`)
        }

        const res = await dbDoc.send(new UpdateCommand({
            TableName: tableName,
            Key: { groupId },
            UpdateExpression: `SET ${sets.join(', ')}`,
            ExpressionAttributeNames: names,
            ExpressionAttributeValues: values,
            ReturnValues: 'ALL_NEW'
        }))
        return json(200, { group: res.Attributes })
    } catch (err) {
        return toHttpError(err)
    }
}
