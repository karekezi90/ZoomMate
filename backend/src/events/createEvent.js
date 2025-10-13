import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { dbDoc, getUserSubFromAuth, json, parseBody, toHttpError } from '../_utils.js'

export const handler = async (event) => {
    try {
        const tableName = process.env.EVENTS_TABLE
        if (!tableName) {
            return json(500, { error: 'EVENTS_TABLE not set' })
        }

        const groupId = event?.pathParameters?.groupId
        if (!groupId) {
            return json(400, { error: 'groupId is required' })
        }

        const me = await getUserSubFromAuth(event)
        if (!me) {
            return json(401, { error: 'Unauthorized' })
        }

        const body = parseBody(event)
        if (!body) {
            return json(400, { error: 'Invalid JSON' })
        }

        const { title, description = '', startsAt, endsAt, location = '', capacity = 0 } = body
        if (!title) {
            return json(400, { error: 'title is required' })
        }
        if (!startsAt) {
            return json(400, { error: 'startsAt is required (ISO string)' })
        }

        const now = new Date().toISOString()
        const eventId = randomUUID()
        const item = {
            eventId,
            groupId,
            title: String(title).trim(),
            description: String(description || '').trim(),
            startsAt,
            endsAt: endsAt || null,
            location: String(location || '').trim(),
            capacity: Number(capacity) || 0,
            attendeesCount: 0,
            createdBy: me,
            isCanceled: false,
            createdAt: now,
            updatedAt: now
        }

        await dbDoc.send(new PutCommand({
            TableName: tableName,
            Item: item,
            ConditionExpression: 'attribute_not_exists(eventId)'
        }))

        return json(201, { event: item })
    } catch (error) {
        return toHttpError(error)
    }
}
