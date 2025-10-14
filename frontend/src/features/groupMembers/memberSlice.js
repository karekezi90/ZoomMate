import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import memberService from './memberService'

const initialState = {
  members: [],
  count: 0,
  listMembersStatus: 'idle',
  joinGroupStatus: 'idle',
  leaveGroupStatus: 'idle',
  error: null,
  nextToken: null
}

export const listMembers = createAsyncThunk(
  'groupMembers/list',
  async ({ groupId, params }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await memberService.listMembers(accessToken, groupId, params || {})
      return res.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const joinGroup = createAsyncThunk(
  'groupMembers/join',
  async ({ groupId }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await memberService.joinGroup(accessToken, groupId)
      return res.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const leaveGroup = createAsyncThunk(
  'groupMembers/leave',
  async ({ groupId, userId }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const res = await memberService.leaveGroup(accessToken, groupId, userId)
      return { groupId, userId, ...res.data }
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

const groupMembersSlice = createSlice({
  name: 'groupMembers',
  initialState,
  reducers: {
    resetGroupMembersState: (state) => {
      state.members = []
      state.count = 0
      state.listMembersStatus = 'idle'
      state.joinGroupStatus = 'idle'
      state.leaveGroupStatus = 'idle'
      state.error = null
      state.nextToken = null
    }, 
    resetGroupMamberStatus: (state) => {
      state.listMembersStatus = 'idle'
      state.joinGroupStatus = 'idle'
      state.leaveGroupStatus = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listMembers.pending, (state) => {
        state.listMembersStatus = 'loading'
        state.error = null
      })
      .addCase(listMembers.fulfilled, (state, action) => {
        state.listMembersStatus = 'succeeded'
        const payload = action.payload || {}
        state.members = payload.items || payload.members || []
        state.count = payload.count || state.members.length
        state.nextToken = payload.nextToken || null
      })
      .addCase(listMembers.rejected, (state, action) => {
        state.listMembersStatus = 'failed'
        state.error = action.payload || action.error?.message
      })
      .addCase(joinGroup.pending, (state) => {
        state.joinGroupStatus = 'loading'
        state.error = null
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.joinGroupStatus = 'succeeded'
        const m = action.payload?.member
        if (m) {
          const exists = state.members.some(x => x.userId === m.userId)
          if (!exists) {
            state.members.unshift(m)
            state.count += 1
          }
        }
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.joinGroupStatus = 'failed'
        state.error = action.payload || action.error?.message
      })
      .addCase(leaveGroup.pending, (state) => {
        state.leaveGroupStatus = 'loading'
        state.error = null
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.leaveGroupStatus = 'succeeded'
        const userId = action.meta?.arg?.userId
        if (userId) {
          state.members = state.members.filter(m => m.userId != userId)
          state.count = Math.max(0, state.count - 1)
        }
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.leaveGroupStatus = 'failed'
        state.error = action.payload || action.error?.message
      })
  }
})

export const { resetGroupMembersState, resetGroupMamberStatus } = groupMembersSlice.actions
export default groupMembersSlice.reducer
