import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { json, dbDoc, toHttpError } from '../_utils.js'

export const handler = async (event) => {
    const tableName = process.env.GROUPS_TABLE
    if (!tableName) {
        return json(500, { error: 'GROUPS_TABLE not set' })
    }

    const groupId = event?.pathParameters?.groupId
    if (!groupId) return json(400, { error: 'groupId is required' })

    try {
        const res = await dbDoc.send(new GetCommand({
            TableName: tableName,
            Key: { groupId }
        }))
        if (!res.Item) {
            return json(404, { error: 'Group not found' })
        }
        return json(200, { group: res.Item })
    } catch (error) {
        return toHttpError(error)
    }
}
