import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import userReducer from '../features/users/userSlice'
import groupsReducer from '../features/groups/groupSlice'
import groupMembersReducer from '../features/groupMembers/memberSlice'
import eventsReducer from '../features/events/eventsSlice'
import attendeesReducer from '../features/eventAttendees/attendeesSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        groups: groupsReducer,
        groupMembers: groupMembersReducer,
        events: eventsReducer,
        attendees: attendeesReducer
    }
})

export default store