import axios from 'axios'
import { getBaseAPI, getStage } from '../../auth/_utils.js'

export const baseAPI = await getBaseAPI()

const stage = await getStage()
export const isProd = stage === 'prod' || stage === 'production' 

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