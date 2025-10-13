import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import 'dotenv/config'

export const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION, 
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
  const region = process.env.APP_REGION || 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/ZoomMate/baseAPI' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}

export const getStage = async () => {
  const region = process.env.APP_REGION || 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/ZoomMate/stage' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}

export const getUsersTableName = async () => {
  const region = process.env.APP_REGION || 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/ZoomMate/usersTable' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}

export const ALLOWED_FIELDS = [
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