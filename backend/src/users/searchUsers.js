import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { 
    json, 
    dbDoc,
    parseBody,
    toHttpError, 
    decodeToken,
    encodeToken,
    getAccessToken, 
    EQUAL_FILTERS, 
    ARRAY_CONTAINS_FILTERS 
} from '../_utils.js'

export const handler = async (event) => {
    const body = parseBody(event) || {}
    if (!body) {
        return json(400, { error: 'Invalid JSON!' })
    }

    const accessToken = getAccessToken(event) 
    if (!accessToken) {
        return json(400, { error: 'Access Token is required!' })
    }

    const tableName = process.env.USERS_TABLE
    if (!tableName) {
        return json(500, { error: 'Server misconfiguration: USERS_TABLE not set' })
    }

    // pagination & inputs from body
    const limitNum = Math.min(Math.max(parseInt(body.limit ?? '25', 10) || 25, 1), 100)
    const exclusiveStartKey = decodeToken(body.nextToken)

    const filters = {
        gender: body.gender,
        pronouns: body.pronouns,
        maritalStatus: body.maritalStatus,
        employmentStatus: body.employmentStatus,
        jobTitle: body.jobTitle,
        company: body.company,
        industry: body.industry,
        hobbies: body.hobbies,
        sports: body.sports,
        interests: body.interests,
        yearsExperienceMin: body.yearsExperienceMin,
        yearsExperienceMax: body.yearsExperienceMax
    }

    try {
        // Build FilterExpression dynamically
        const exprNames = {}
        const exprValues = {}
        const clauses = []

        for (const k of EQUAL_FILTERS) {
            const v = filters[k]
            if (v !== undefined && v !== '') {
                const nk = `#${k}`
                const vk = `:${k}`
                exprNames[nk] = k
                exprValues[vk] = v
                clauses.push(`${nk} = ${vk}`)
            }
        }

        for (const k of ARRAY_CONTAINS_FILTERS) {
            const v = filters[k]
            if (Array.isArray(v)) {
                // if an array is provided, require all of them (AND). Switch to OR by joining with ' OR ' in a parenthesis
                const subClauses = []
                v.forEach((val, i) => {
                    const nk = `#${k}`
                    const vk = `:${k}${i}`
                    exprNames[nk] = k
                    exprValues[vk] = val
                    subClauses.push(`contains(${nk}, ${vk})`)
                })
                if (subClauses.length) {
                    clauses.push(`(${subClauses.join(' AND ')})`)
                }
            } else if (v !== undefined && v !== '') {
                const nk = `#${k}`
                const vk = `:${k}`
                exprNames[nk] = k
                exprValues[vk] = v
                clauses.push(`contains(${nk}, ${vk})`)
            }
        }

        const minYE = filters.yearsExperienceMin !== undefined ? Number(filters.yearsExperienceMin) : undefined
        const maxYE = filters.yearsExperienceMax !== undefined ? Number(filters.yearsExperienceMax) : undefined
        if (!Number.isNaN(minYE) && minYE !== undefined) {
            exprNames['#yearsExperience'] = 'yearsExperience'
            exprValues[':minYE'] = minYE
            clauses.push('#yearsExperience >= :minYE')
        }
        if (!Number.isNaN(maxYE) && maxYE !== undefined) {
            exprNames['#yearsExperience'] = 'yearsExperience'
            exprValues[':maxYE'] = maxYE
            clauses.push('#yearsExperience <= :maxYE')
        }

        const params = {
            TableName: tableName,
            Limit: limitNum,
            ExclusiveStartKey: exclusiveStartKey
        }

        if (clauses.length > 0) {
            params.FilterExpression = clauses.join(' AND ')
            params.ExpressionAttributeNames = exprNames
            params.ExpressionAttributeValues = exprValues
        }

        const res = await dbDoc.send(new ScanCommand(params))

        return json(200, {
            items: res.Items ?? [],
            count: res.Count ?? 0,
            scannedCount: res.ScannedCount ?? 0,
            nextToken: encodeToken(res.LastEvaluatedKey) || null
        })
    } catch (error) {
        const name = error?.name || ''
        if (name === 'NotAuthorizedException') {
            return json(401, { error: 'Unauthorized request' })
        }
        return toHttpError(error)
    }
}
