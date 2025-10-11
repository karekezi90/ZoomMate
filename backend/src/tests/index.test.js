import { userExists } from './auth/testingData.js'

if (await userExists()) {
  await import('./auth/signin.test.js')
  await import('./auth/signout.test.js')
  await import('./auth/deleteSelf.test.js')
} 
else {
  await import('./auth/signup.test.js')
  await import('./auth/signin.test.js')
  await import('./auth/signout.test.js')
  await import('./auth/deleteSelf.test.js')
}