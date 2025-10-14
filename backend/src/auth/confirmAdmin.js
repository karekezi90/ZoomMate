import { 
  AdminConfirmSignUpCommand 
} from '@aws-sdk/client-cognito-identity-provider'
import { 
  json,
  cognito,
  parseBody,
  toHttpError 
} from '../_utils.js'

export const handler = async (event) => {
  if (process.env.STAGE === 'prod' || process.env.STAGE === 'production') {
    return { statusCode: 403, body: 'Forbidden' }
  }

  const body = parseBody(event)
  if (!body) {
    return json(400, { error: 'Invalid JSON' })
  }

  const { email } = body
  if (!email) {
    return json(400, { error: 'email required' })
  }

  try {
    const cmd = new AdminConfirmSignUpCommand({
      UserPoolId: process.env.USER_POOL_ID, 
      Username: email
    })
    await cognito.send(cmd)
  
    return json(200, { message: 'Confirmed' })
  } catch (error) {
    return toHttpError(error)
  }
}
