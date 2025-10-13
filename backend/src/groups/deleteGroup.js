import { GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { json, dbDoc, toHttpError, getUserSubFromAuth } from '../_utils.js'

export const handler = async (event) => {
    const me = await getUserSubFromAuth(event)
    if (!me) {
        return json(401, { error: 'Unauthorized' })
    }

    const tableName = process.env.GROUPS_TABLE
    if (!tableName) {
        return json(500, { error: 'GROUPS_TABLE not set' })
    }

    const groupId = event?.pathParameters?.groupId
    if (!groupId) {
        return json(400, { error: 'groupId is required' })
    }

    try {
        const current = await dbDoc.send(new GetCommand({ 
            TableName: tableName, 
            Key: { groupId } 
        }))
        if (!current.Item) {
            return json(404, { error: 'Group not found' })
        }
        if (current.Item.ownerId !== me) {
            return json(403, { error: 'Forbidden: only owner can delete' })
        }

        await dbDoc.send(new DeleteCommand({
            TableName: tableName,
            Key: { groupId },
            ConditionExpression: 'attribute_exists(groupId)'
        }))
        return json(200, { message: 'Group deleted' })
    } catch (error) {
        return toHttpError(error)
    }
}
