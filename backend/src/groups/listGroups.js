import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { 
    json, 
    dbDoc,
    toHttpError, 
    decodeToken,
    encodeToken,
} from '../_utils.js'

export const handler = async (event) => {
    const tableName = process.env.GROUPS_TABLE
    if (!tableName) {
        return json(500, { error: 'GROUPS_TABLE not set' })
    }

    const qs = event?.queryStringParameters || {}

    const limit = Math.min(Math.max(parseInt(qs.limit || '25', 10) || 25, 1), 100)
    const nextToken = qs.nextToken
    const exclusiveStartKey = decodeToken(nextToken)

    const ownerId = qs.ownerId // if "me" needed, resolve on FE or add an auth-aware variant later
    const tag = qs.tag || qs.tags // single tag contains()
    const name = qs.name // naive contains() search via Scan

    try {
        // If ownerId provided, prefer efficient Query on GSI
        if (ownerId) {
        const params = {
            TableName: tableName,
            IndexName: 'ownerId-index',
            KeyConditionExpression: '#ownerId = :oid',
            ExpressionAttributeNames: { '#ownerId': 'ownerId' },
            ExpressionAttributeValues: { ':oid': ownerId },
            Limit: limit,
            ExclusiveStartKey: exclusiveStartKey
        }
        const res = await dbDoc.send(new QueryCommand(params))
        return json(200, {
            items: res.Items ?? [],
            count: res.Count ?? 0,
            nextToken: encodeToken(res.LastEvaluatedKey) || null
        })
        }

        // Otherwise, Scan with optional filters
        const names = {}
        const values = {}
        const filters = []

        if (tag) {
            names['#tags'] = 'tags'
            values[':tag'] = tag
            filters.push('contains(#tags, :tag)')
        }
        if (name) {
            names['#name'] = 'name'
            values[':name'] = name
            filters.push('contains(#name, :name)')
        }

        const params = {
            TableName: tableName,
            Limit: limit,
            ExclusiveStartKey: exclusiveStartKey
        }
        if (filters.length) {
            params.FilterExpression = filters.join(' AND ')
            params.ExpressionAttributeNames = names
            params.ExpressionAttributeValues = values
        }

        const res = await dbDoc.send(new ScanCommand(params))
        return json(200, {
            items: res.Items ?? [],
            count: res.Count ?? 0,
            scannedCount: res.ScannedCount ?? 0,
            nextToken: encodeToken(res.LastEvaluatedKey) || null
        })
    } catch (error) {
        return toHttpError(error)
    }
}
