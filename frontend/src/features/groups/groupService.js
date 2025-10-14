import { apiClient,  authHeader} from '../apiClient'

const GROUPS_PATH = '/groups'

const listGroups = async (accessToken, params = {}) => {
  return await apiClient.get(GROUPS_PATH, { ...authHeader(accessToken), params })
}

const getGroup = async (accessToken, groupId) => {
  return await apiClient.get(`${GROUPS_PATH}/${groupId}`, authHeader(accessToken))
}

const createGroup = async (accessToken, payload) => {
  return await apiClient.post(GROUPS_PATH, payload, authHeader(accessToken))
}

const updateGroup = async (accessToken, groupId, payload) => {
  return await apiClient.put(`${GROUPS_PATH}/${groupId}`, payload, authHeader(accessToken))
}

const deleteGroup = async (accessToken, groupId) => {
  return await apiClient.delete(`${GROUPS_PATH}/${groupId}`, authHeader(accessToken))
}

const groupService = {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup
}

export default groupService
