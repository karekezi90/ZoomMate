import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import 'dotenv/config'

export const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION, 
})

export const json = (statusCode, data) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
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
      return json(409, { error: 'User already exists' });

    case 'InvalidPasswordException':
      return json(400, { error: 'Password does not meet policy' });

    case 'InvalidParameterException':
      return json(400, { error: msg });

    case 'CodeMismatchException':
      return json(400, { error: 'Invalid confirmation code' });

    case 'ExpiredCodeException':
      return json(400, { error: 'Confirmation code expired' });

    case 'UserNotFoundException':
      return json(404, { error: 'User not found' });

    case 'UserNotConfirmedException':
      return json(403, { error: 'User not confirmed' });

    case 'NotAuthorizedException':
      return json(401, { error: 'Incorrect username or password' });

    default:
      return json(500, { error: `Unexpected error: ${msg}` });
  }

}

export const getBaseAPI = async () => {
  const region = process.env.APP_REGION || 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/hotelApp/baseAPI' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}

export const getStage = async () => {
  const region = process.env.APP_REGION || 'ap-southeast-2'
  const ssm = new SSMClient({ region })
  const cmd = new GetParameterCommand({ Name: '/hotelApp/stage' })
  const { Parameter } = await ssm.send(cmd)
  return Parameter.Value
}