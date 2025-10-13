import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { dbDoc, getUserSubFromAuth, json, toHttpError } from '../_utils.js'

export const handler = async (event) => {
  try {
    const tableName = process.env.GROUP_MEMBERS_TABLE
    if (!tableName) {
      return json(500, { error: 'GROUP_MEMBERS_TABLE not set' })
    }

    const groupId = event?.pathParameters?.groupId
    if (!groupId) {
      return json(400, { error: 'groupId is required' })
    }

    const me = await getUserSubFromAuth(event)
    if (!me) {
      return json(401, { error: 'Unauthorized' })
    }

    const now = new Date().toISOString()
    const item = {
      groupId,
      userId: me,
      role: 'member',
      joinedAt: now
    }

    await dbDoc.send(new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(groupId) AND attribute_not_exists(userId)'
    }))

    return json(201, { member: item })
  } catch (error) {
    return toHttpError(error)
  }
}
