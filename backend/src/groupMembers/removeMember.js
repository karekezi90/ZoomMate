import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { dbDoc, getUserSubFromAuth, json, toHttpError } from '../_utils.js'

export const handler = async (event) => {
  try {
    const tableName = process.env.GROUP_MEMBERS_TABLE
    if (!tableName) {
      return json(500, { error: 'GROUP_MEMBERS_TABLE not set' })
    }

    const groupId = event?.pathParameters?.groupId
    const memberUserId = event?.pathParameters?.userId
    if (!groupId) {
      return json(400, { error: 'groupId is required' })
    }
    if (!memberUserId) {
      return json(400, { error: 'userId is required' })
    }

    const me = await getUserSubFromAuth(event)
    if (!me) {
      return json(401, { error: 'Unauthorized' })
    }
    if (me !== memberUserId) {
      return json(403, { error: 'Forbidden: can only remove yourself from a group in this endpoint' })
    }

    await dbDoc.send(new DeleteCommand({
      TableName: tableName,
      Key: { groupId, userId: memberUserId },
      ConditionExpression: 'attribute_exists(groupId) AND attribute_exists(userId)'
    }))

    return json(200, { message: 'Left group' })
  } catch (error) {
    return toHttpError(error)
  }
}
