import { 
    InitiateAuthCommand
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

  const { email, password } = body
  if (!email || !password) {
    return json(400, { error: 'email and password are required' })
  }

  try {
    const res = await cognito.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH', 
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }))

    // Could also return challenge info (NEW_PASSWORD_REQUIRED, MFA, etc.)
    const tokens = res.AuthenticationResult ?? {}
    return json(200, {
      idToken: tokens.IdToken,
      accessToken: tokens.AccessToken,
      refreshToken: tokens.RefreshToken,
      expiresIn: tokens.ExpiresIn,
      tokenType: tokens.TokenType,
    })
  } catch (err) {
    return toHttpError(err)
  }
}

