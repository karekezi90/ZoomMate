import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { dbDoc, getUserSubFromAuth, json, parseBody, toHttpError } from '../_utils.js'

export const handler = async (event) => {
    try {
        const tableName = process.env.EVENTS_TABLE
        if (!tableName) {
            return json(500, { error: 'EVENTS_TABLE not set' })
        }

        const eventId = event?.pathParameters?.eventId
        if (!eventId) {
            return json(400, { error: 'eventId is required' })
        }

        const me = await getUserSubFromAuth(event)
        if (!me) {
            return json(401, { error: 'Unauthorized' })
        }

        const body = parseBody(event)
        if (!body) {
            return json(400, { error: 'Invalid JSON' })
        }

        const current = await dbDoc.send(new GetCommand({
            TableName: tableName,
            Key: { eventId }
        }))

        if (!current.Item) {
            return json(404, { error: 'Event not found' })
        }

        if (current.Item.createdBy !== me) {
            return json(403, { error: 'Forbidden: only creator can update' })
        }

        const allowed = ['title','description','startsAt','endsAt','location','capacity','isCanceled']
        const patch = {}
        for (const k of allowed) {
            if (Object.prototype.hasOwnProperty.call(body, k)) {
                patch[k] = body[k]
            }
        }

        if (Object.keys(patch).length === 0) {
            return json(400, { error: 'No updatable fields provided' })
        }

        const names = { '#updatedAt': 'updatedAt' }
        const values = { ':updatedAt': new Date().toISOString() }
        const sets = ['#updatedAt = :updatedAt']

        for (const [k, v] of Object.entries(patch)) {
            names['#' + k] = k
            values[':' + k] = v
            sets.push('#' + k + ' = :' + k)
        }

        const res = await dbDoc.send(new UpdateCommand({
            TableName: tableName,
            Key: { eventId },
            UpdateExpression: 'SET ' + sets.join(', '),
            ExpressionAttributeNames: names,
            ExpressionAttributeValues: values,
            ReturnValues: 'ALL_NEW'
        }))

        return json(200, { event: res.Attributes })
    } catch (error) {
        return toHttpError(error)
    }
}
