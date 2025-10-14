import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import attendeesService from './attendeesService'

const initialState = {
  attendees: [],
  count: 0,
  status: 'idle',
  error: null,
  nextToken: null
}

export const listAttendees = createAsyncThunk(
  'attendees/list',
  async ({ eventId, params }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await attendeesService.listAttendees(accessToken, eventId, params || {})
      return res.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const rsvpEvent = createAsyncThunk(
  'attendees/rsvp',
  async ({ eventId }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await attendeesService.rsvpEvent(accessToken, eventId)
      return { eventId, ...res.data }
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const unrsvpEvent = createAsyncThunk(
  'attendees/unrsvp',
  async ({ eventId, userId }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await attendeesService.unrsvpEvent(accessToken, eventId)
      return { eventId, userId, ...res.data }
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

const attendeesSlice = createSlice({
  name: 'attendees',
  initialState,
  reducers: {
    resetAttendeesState: (state) => {
      state.attendees = []
      state.count = 0
      state.status = 'idle'
      state.error = null
      state.nextToken = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listAttendees.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(listAttendees.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const payload = action.payload || {}
        state.attendees = payload.items || payload.attendees || []
        state.count = payload.count || state.attendees.length
        state.nextToken = payload.nextToken || null
      })
      .addCase(listAttendees.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })

      .addCase(rsvpEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(rsvpEvent.fulfilled, (state) => {
        state.status = 'succeeded'
        // let UI refetch attendees or increment counters at component level if needed
      })
      .addCase(rsvpEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
      
      .addCase(unrsvpEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(unrsvpEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const userId = action.meta?.arg?.userId
        if (userId) {
          state.attendees = state.attendees.filter(a => a.userId != userId)
          state.count = Math.max(0, state.count - 1)
        }
      })
      .addCase(unrsvpEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
  }
})

export const { resetAttendeesState } = attendeesSlice.actions
export default attendeesSlice.reducer
