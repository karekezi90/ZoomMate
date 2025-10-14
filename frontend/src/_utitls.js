export const capitalizeFirstLetter = (str) => {
    if (str && typeof(str) === 'string') {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
    return ''
}

export function isValidEmail(email) {
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(String(email).toLowerCase())
}

export const validatePassword = (password) =>  {
    let error = ''

    if (password.length < 8) {
        error = "Password must be at least 8 characters."
    } else if (!/[a-z]/.test(password)) {
        error = "Password must include a lowercase letter."
    } else if (!/[A-Z]/.test(password)) {
        error = "Password must include an uppercase letter."
    } else if (!/\d/.test(password)) {
        error = "Password must include a number."
    }

    return {
        isValid: error === '',
        error
    }
}

export const areTokensExpired = (issuedAt, expiresIn) => {
  const now = Date.now()
  const expirationTime = issuedAt + expiresIn * 1000

  return now >= expirationTime
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

export const filterAllowedFields = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => ALLOWED_FIELDS.includes(key))
    )
}
