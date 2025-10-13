import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { dbDoc, json, toHttpError } from '../_utils.js'

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

        const res = await dbDoc.send(new GetCommand({
            TableName: tableName,
            Key: { eventId }
        }))

        if (!res.Item) {
            return json(404, { error: 'Event not found' })
        }

        return json(200, { event: res.Item })
    } catch (error) {
        return toHttpError(error)
    }
}
