import { randomUUID } from 'crypto'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
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

    const body = parseBody(event)
    if (!body) {
        return json(400, { error: 'Invalid JSON' })
    }

    const { name, description = '', tags = [] } = body
    if (!name || String(name).trim().length < 3) {
        return json(400, { error: 'name is required (min 3 chars)' })
    }
    if (!Array.isArray(tags)) {
        return json(400, { error: 'tags must be an array' })
    }

    const now = new Date().toISOString()
    const group = {
        groupId: randomUUID(),
        ownerId: me,
        name: String(name).trim(),
        description: String(description || '').trim(),
        tags,
        createdAt: now,
        updatedAt: now
    }

    try {
        await dbDoc.send(new PutCommand({
            TableName: tableName,
            Item: group,
            ConditionExpression: 'attribute_not_exists(groupId)'
        }))
        return json(201, { group })
    } catch (error) {
        return toHttpError(error)
    }
}
