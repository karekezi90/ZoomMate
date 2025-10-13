import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { dbDoc, getUserSubFromAuth, json, toHttpError } from '../_utils.js'

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

    const current = await dbDoc.send(new GetCommand({
      TableName: tableName,
      Key: { eventId }
    }))

    if (!current.Item) {
      return json(404, { error: 'Event not found' })
    }

    if (current.Item.createdBy !== me) {
      return json(403, { error: 'Forbidden: only creator can delete' })
    }

    await dbDoc.send(new DeleteCommand({
      TableName: tableName,
      Key: { eventId },
      ConditionExpression: 'attribute_exists(eventId)'
    }))

    return json(200, { message: 'Event deleted' })
  } catch (error) {
    return toHttpError(error)
  }
}
