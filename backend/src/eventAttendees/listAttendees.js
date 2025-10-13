import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dbDoc, json, toHttpError, decodeToken, encodeToken } from '../_utils.js'

export const handler = async (event) => {
  try {
    const tableName = process.env.EVENT_ATTENDEES_TABLE
    if (!tableName) {
      return json(500, { error: 'EVENT_ATTENDEES_TABLE not set' })
    }

    const eventId = event?.pathParameters?.eventId
    if (!eventId) {
      return json(400, { error: 'eventId is required' })
    }

    const qs = event?.queryStringParameters || {}
    const limit = Math.min(Math.max(parseInt(qs.limit || '25', 10) || 25, 1), 100)
    const exclusiveStartKey = decodeToken(qs.nextToken)

    const res = await dbDoc.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#eid = :e',
      ExpressionAttributeNames: { '#eid': 'eventId' },
      ExpressionAttributeValues: { ':e': eventId },
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey
    }))

    return json(200, {
      items: res.Items ?? [],
      count: res.Count ?? 0,
      nextToken: encodeToken(res.LastEvaluatedKey) || null
    })
  } catch (error) {
    return toHttpError(error)
  }
}
