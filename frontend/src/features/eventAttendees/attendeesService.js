import { apiClient,  authHeader} from '../apiClient'

const listAttendees = async (accessToken, eventId, params = {}) => {
  return await apiClient.get(`/events/${eventId}/attendees`, { ...authHeader(accessToken), params })
}

const rsvpEvent = async (accessToken, eventId) => {
  return await apiClient.post(`/events/${eventId}/attendees`, {}, authHeader(accessToken))
}

const unrsvpEvent = async (accessToken, eventId) => {
  return await apiClient.delete(`/events/${eventId}/attendees/me`, authHeader(accessToken))
}

const attendeesService = {
  listAttendees,
  rsvpEvent,
  unrsvpEvent
}

export default attendeesService
