import { 
    SignUpCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { 
    json, 
    cognito,
    parseBody, 
    toHttpError 
} from './_utils.js'

export const handler = async (event) => {
  const body = parseBody(event)
  if (!body) {
    return json(400, { error: 'Invalid JSON' })
  }

  const { email, password, given_name, family_name, name } = body
  if (!email || !password) {
    return json(400, { error: 'email and password are required' })
  }

  try {
    const cmd = new SignUpCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        ...(given_name ? [{ Name: 'given_name', Value: String(given_name) }] : []),
        ...(family_name ? [{ Name: 'family_name', Value: String(family_name) }] : []),
        ...(name ? [{ Name: 'name', Value: String(name) }] : []),
      ],
    })
    const res = await cognito.send(cmd)
    return json(200, {
      userConfirmed: res.UserConfirmed ?? false,
      userSub: res.UserSub,
      delivery: res.CodeDeliveryDetails,
      message: res.UserConfirmed ? 'User created' : 'User created, confirmation code sent',
    })
  } catch (error) {
    return toHttpError(error)
  }
}

