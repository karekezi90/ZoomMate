import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
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

    const now = new Date().toISOString()
    await dbDoc.send(new PutCommand({
      TableName: attendeesTable,
      Item: { eventId, userId: me, joinedAt: now },
      ConditionExpression: 'attribute_not_exists(eventId) AND attribute_not_exists(userId)'
    }))

    await dbDoc.send(new UpdateCommand({
      TableName: eventsTable,
      Key: { eventId },
      UpdateExpression: 'SET #updatedAt = :now ADD #cnt :one',
      ConditionExpression: 'attribute_exists(eventId) AND (attribute_not_exists(#cap) OR #cnt < #cap)',
      ExpressionAttributeNames: { '#cnt': 'attendeesCount', '#cap': 'capacity', '#updatedAt': 'updatedAt' },
      ExpressionAttributeValues: { ':one': 1, ':now': now }
    }))

    return json(200, { message: 'RSVP confirmed' })
  } catch (error) {
    return toHttpError(error)
  }
}
