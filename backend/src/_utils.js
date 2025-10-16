import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

export const cognito = new CognitoIdentityProviderClient({
  region: 'ap-southeast-2', 
})

const ddb = new DynamoDBClient({})
export const dbDoc = DynamoDBDocumentClient.from(ddb, { marshallOptions: { removeUndefinedValues: true } })

export const json = (statusCode, data) => ({
  statusCode,
  headers: { 
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'false',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  },
  body: JSON.stringify(data),
})

export const parseBody = (event) => {
  try {
    return JSON.parse(event.body ?? '{}')
  } catch {
    return null
  }
}

// Mapping Cognito errors to HTTP statuses
export const toHttpError = (err) => {
  const name = err?.name || ''
  const msg = err?.message || String(err)

  switch (name) {
    case 'UsernameExistsException':
      return json(409, { error: 'User already exists' })

    case 'InvalidPasswordException':
      return json(400, { error: 'Password does not meet policy' })

    case 'InvalidParameterException':
      return json(400, { error: msg })

    case 'CodeMismatchException':
      return json(400, { error: 'Invalid confirmation code' })

    case 'ExpiredCodeException':
      return json(400, { error: 'Confirmation code expired' })

    case 'UserNotFoundException':
      return json(404, { error: 'User not found' })

    case 'UserNotConfirmedException':
      return json(403, { error: 'User not confirmed' })

    case 'NotAuthorizedException':
      return json(401, { error: 'Incorrect username or password' })

    default:
      return json(500, { error: `Unexpected error: ${msg}` })
  }

}

export const getAccessToken = event => {
  const h = event?.headers || {}
  const auth = h.authorization ?? h.Authorization
  if (auth) {
    const m = String(auth).match(/^Bearer\s+(.+)$/i)
    if (m) {
      return m[1].trim()
    }
  }

  const qs = event?.queryStringParameters || {}
  if (qs?.accessToken) {
    return String(qs.accessToken).trim()
  }

  const body = parseBody(event) || {}
  if (body?.accessToken) {
    return String(body.accessToken).trim()
  }

  return null
}

export const getUserSubFromAuth = async (event) => {
  const accessToken = getAccessToken(event)
  if (!accessToken) {
    return null
  }

  return await getUserSub(accessToken)
}

export const getUserSub = async (accessToken) => {
  const res = await cognito.send(new GetUserCommand({ AccessToken: accessToken }))
  const subAttr = res.UserAttributes?.find(a => a.Name === 'sub')
  return subAttr?.Value || res.Username
}

export const getBaseAPI = async () => {
  const region = 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/ZoomMate/dev/baseAPI' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}

console.log('getBaseAPI function defined', await getBaseAPI())

export const getStage = async () => {
  const region = 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/ZoomMate/stage' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}

export const getUsersTableName = async () => {
  const region = 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/ZoomMate/usersTable' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}

export const ALLOWED_FIELDS = [
    'bio',
    'firstName',
    'lastName',
    'gender',
    'pronouns',
    'maritalStatus',
    'employmentStatus',
    'jobTitle',
    'company',
    'industry',
    'yearsExperience',
    'hobbies',
    'sports',
    'interests',
    'website',
    'linkedin',
    'twitter',
    'preferredMeetingTimes'
]

// Filters we allow (equality)
export const EQUAL_FILTERS = [
  'gender',
  'pronouns',
  'maritalStatus',
  'employmentStatus',
  'jobTitle',
  'company',
  'industry',
]

// Array fields we allow with "contains"
export const ARRAY_CONTAINS_FILTERS = ['hobbies', 'sports', 'interests']

export const decodeToken = (t) => {
  try { 
    return t ? JSON.parse(Buffer.from(t, 'base64').toString('utf8')) : undefined 
  } catch { 
    return undefined 
  }
}
export const encodeToken = (k) => (k ? Buffer.from(JSON.stringify(k), 'utf8').toString('base64') : undefined)


// ------------------ PURGE USER GROUPS & MEMBERSHIPS ------------------
// When a user is deleted, we need to also delete:
//  - All groups they own
//  - All memberships in those groups
//  - All memberships where they are a member (even in groups they don't own)
const GROUPS_TABLE = process.env.GROUPS_TABLE
const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE
const GROUPS_OWNER_GSI = process.env.GROUPS_OWNER_GSI || "ownerId-index" // GSI on ownerId
const MEMBERS_USER_GSI = process.env.MEMBERS_USER_GSI || "userId-index"   // GSI on userId

const chunk = (arr, size) => {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const queryAll = async (params) => {
  let items = []
  let ExclusiveStartKey
  do {
    const res = await ddb.send(new QueryCommand({ ...params, ExclusiveStartKey }))
    items = items.concat(res.Items || [])
    ExclusiveStartKey = res.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

const dedupeDeleteRequests = (requestItemsByTable) => {
  const deduped = {}
  for (const [table, ops] of Object.entries(requestItemsByTable)) {
    const seen = new Set()
    deduped[table] = []
    for (const op of ops) {
      const keyJson = JSON.stringify(op.DeleteRequest.Key) 
      if (!seen.has(keyJson)) {
        seen.add(keyJson)
        deduped[table].push(op)
      }
    }
  }
  return deduped
}

const batchWriteAll = async (requestItemsByTable) => {
  const requestItems = dedupeDeleteRequests(requestItemsByTable);

  // Flatten to (table, op) pairs, then chunk into 25 total ops per call
  const entries = Object.entries(requestItems).flatMap(([table, ops]) =>
    ops.map(op => ({ table, op }))
  )
  const batches = chunk(entries, 25)

  for (const batch of batches) {
    // Rebuild RequestItems shape for this batch
    const RequestItems = batch.reduce((acc, { table, op }) => {
      (acc[table] ||= []).push(op)
      return acc
    }, {})

    let UnprocessedItems = RequestItems
    let attempt = 0
    while (Object.keys(UnprocessedItems).length) {
      const res = await ddb.send(new BatchWriteCommand({ RequestItems: UnprocessedItems }))
      UnprocessedItems = res.UnprocessedItems || {}
      if (Object.keys(UnprocessedItems).length) {
        attempt += 1
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 8000)))
      }
    }
  }
}

/**
 * Purge:
 *  - All groups owned by userId (and ALL memberships in those groups)
 *  - All memberships where userId is a member
 */
export const purgeUserGroupsAndMemberships = async (userId) => {
  // 1) Groups owned by the user
  const ownedGroups = await queryAll({
    TableName: GROUPS_TABLE,
    IndexName: GROUPS_OWNER_GSI,
    KeyConditionExpression: "#ownerId = :ownerId",
    ExpressionAttributeNames: { "#ownerId": "ownerId" },
    ExpressionAttributeValues: { ":ownerId": userId }
  })

  // 1a) All memberships for owned groups (in parallel)
  const ownedGroupIds = ownedGroups.map(g => g.groupId)
  const ownedGroupMembersArrays = await Promise.all(
    ownedGroupIds.map(groupId =>
      queryAll({
        TableName: GROUP_MEMBERS_TABLE,
        KeyConditionExpression: "#groupId = :gid",
        ExpressionAttributeNames: { "#groupId": "groupId" },
        ExpressionAttributeValues: { ":gid": groupId }
      }).then(items => items.map(m => ({ groupId, userId: m.userId })))
    )
  )
  const membershipDeletesForOwned = ownedGroupMembersArrays.flat().map(k => ({
    DeleteRequest: { Key: k }
  }))

  // 1b) Delete the owned group items themselves
  const groupDeletes = ownedGroups.map(g => ({
    DeleteRequest: { Key: { groupId: g.groupId } }
  }))

  // 2) Memberships where the user is a member anywhere (may overlap 1a)
  const myMemberships = await queryAll({
    TableName: GROUP_MEMBERS_TABLE,
    IndexName: MEMBERS_USER_GSI,
    KeyConditionExpression: "#userId = :uid",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":uid": userId }
  })
  const myMembershipDeletes = myMemberships.map(m => ({
    DeleteRequest: { Key: { groupId: m.groupId, userId: m.userId } }
  }))

  // Combine → de-dupe → batch
  const requestItems = {
    [GROUP_MEMBERS_TABLE]: [].concat(membershipDeletesForOwned, myMembershipDeletes),
    [GROUPS_TABLE]: groupDeletes
  }

  await batchWriteAll(requestItems)

  return {
    ownedGroupsDeleted: groupDeletes.length,
    membershipsDeletedFromOwnedGroups: membershipDeletesForOwned.length,
    membershipsDeletedAsMember: myMembershipDeletes.length
  }
}
