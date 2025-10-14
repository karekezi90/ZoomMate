import { apiClient,  authHeader} from '../apiClient'

const listMembers = async (accessToken, groupId, params = {}) => {
  return await apiClient.get(`/groups/${groupId}/members`, { ...authHeader(accessToken), params })
}

const joinGroup = async (accessToken, groupId) => {
  return await apiClient.post(`/groups/${groupId}/members`, {}, authHeader(accessToken))
}

const leaveGroup = async (accessToken, groupId, userId) => {
  return await apiClient.delete(`/groups/${groupId}/members/${userId}`, authHeader(accessToken))
}

const memberService = {
  listMembers,
  joinGroup,
  leaveGroup
}

export default memberService
