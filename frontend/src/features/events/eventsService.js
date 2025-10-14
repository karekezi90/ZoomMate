import { apiClient,  authHeader} from '../apiClient'

const listEventsByGroup = async (accessToken, groupId, params = {}) => {
  return await apiClient.get(`/groups/${groupId}/events`, { ...authHeader(accessToken), params })
}

const getEvent = async (accessToken, eventId) => {
  return await apiClient.get(`/events/${eventId}`, authHeader(accessToken))
}

const createEvent = async (accessToken, groupId, payload) => {
  return await apiClient.post(`/groups/${groupId}/events`, payload, authHeader(accessToken))
}

const updateEvent = async (accessToken, eventId, payload) => {
  return await apiClient.put(`/events/${eventId}`, payload, authHeader(accessToken))
}

const deleteEvent = async (accessToken, eventId) => {
  return await apiClient.delete(`/events/${eventId}`, authHeader(accessToken))
}

const eventsService = {
  listEventsByGroup,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
}

export default eventsService
