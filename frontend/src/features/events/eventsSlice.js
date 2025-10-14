import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import eventsService from './eventsService'

const initialState = {
  events: [],
  event: null,
  status: 'idle',
  error: null,
  nextToken: null
}

export const listEventsByGroup = createAsyncThunk(
  'events/listByGroup',
  async ({ groupId, params }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await eventsService.listEventsByGroup(accessToken, groupId, params || {})
      return res.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const getEvent = createAsyncThunk(
  'events/getById',
  async (eventId, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await eventsService.getEvent(accessToken, eventId)
      return res.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const createEvent = createAsyncThunk(
  'events/create',
  async ({ groupId, payload }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await eventsService.createEvent(accessToken, groupId, payload)
      return res.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ eventId, payload }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await eventsService.updateEvent(accessToken, eventId, payload)
      return res.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (eventId, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await eventsService.deleteEvent(accessToken, eventId)
      return { eventId, ...res.data }
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    resetEventsState: (state) => {
      state.events = []
      state.event = null
      state.status = 'idle'
      state.error = null
      state.nextToken = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listEventsByGroup.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(listEventsByGroup.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const payload = action.payload || {}
        state.events = payload.items || payload.events || []
        state.nextToken = payload.nextToken || null
      })
      .addCase(listEventsByGroup.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })

      .addCase(getEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(getEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.event = action.payload?.event || null
      })
      .addCase(getEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })

      .addCase(createEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const e = action.payload?.event
        if (e) {
          state.events.unshift(e)
          state.event = e
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })

      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const e = action.payload?.event
        if (e) {
          state.event = e
          const idx = state.events.findIndex(x => x.eventId === e.eventId)
          if (idx !== -1) {
            state.events[idx] = e
          }
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
      
      .addCase(deleteEvent.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const id = action.payload?.eventId
        if (id) {
          state.events = state.events.filter(e => e.eventId !== id)
          if (state.event?.eventId === id) {
            state.event = null
          }
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
  }
})

export const { resetEventsState } = eventsSlice.actions
export default eventsSlice.reducer
