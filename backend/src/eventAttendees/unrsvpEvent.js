import { DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { dbDoc, getUserSubFromAuth, json, toHttpError } from '../_utils.js'

export const handler = async (event) => {
  try {
    const attendeesTable = process.env.EVENT_ATTENDEES_TABLE
    const eventsTable = process.env.EVENTS_TABLE
    if (!attendeesTable) {
      return json(500, { error: 'EVENT_ATTENDEES_TABLE not set' })
    }
    if (!eventsTable) {
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

    await dbDoc.send(new DeleteCommand({
      TableName: attendeesTable,
      Key: { eventId, userId: me },
      ConditionExpression: 'attribute_exists(eventId) AND attribute_exists(userId)'
    }))

    await dbDoc.send(new UpdateCommand({
      TableName: eventsTable,
      Key: { eventId },
      UpdateExpression: 'SET #updatedAt = :now ADD #cnt :neg',
      ConditionExpression: 'attribute_exists(eventId) AND attribute_exists(#cnt) AND #cnt > :zero',
      ExpressionAttributeNames: { '#cnt': 'attendeesCount', '#updatedAt': 'updatedAt' },
      ExpressionAttributeValues: { ':neg': -1, ':zero': 0, ':now': new Date().toISOString() }
    }))

    return json(200, { message: 'RSVP canceled' })
  } catch (error) {
    return toHttpError(error)
  }
}
