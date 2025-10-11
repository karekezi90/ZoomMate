import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"

const ddb = new DynamoDBClient()

export const handler = async (event) => {
    const sub = event.request.userAttributes.sub
    const email = event.request.userAttributes.email
    const cmd = new PutItemCommand({
        TableName: process.env.USERS_TABLE,
        Item: {
            userId: { S:  sub },
            email: { S: email },
            createdAt: { S: new Date().toISOString() }
        },
        ConditionExpression: 'attribute_not_exists(userId)'
    })

    await ddb.send(cmd)

    return event
}