import axios from 'axios'
import { getBaseAPI } from '../../_utils.js'

export const baseAPI = await getBaseAPI()

export const correctPayload = {
    email: 'sample@example.com',
    password: 'SecurePass123#'
}
export const payloadWithInvalidPassword = {
    email: 'sample@example.com',
    password: 'SecurePass'
}
export const payloadWithInvalidEmail = {
    email: 'sampleexample.com',
    password: 'SecurePass'
}
export const payloadWithoutPassword = {
    email: 'sample@example.com'
}
export const payloadWithoutEmail = {
    password: 'SecurePass123#'
}
export const session = {
    accessToken: null
}

export const userExists = async () => {
  try {
    await axios.post(`${baseAPI}/auth/signin`, correctPayload)
    return true 
  } catch (error) {
    return false
  }
}