import { 
  createSlice, 
  createAsyncThunk 
} from '@reduxjs/toolkit'
import groupService from './groupService'

const initialState = {
  groups: [],
  group: null,
  listGroupsStatus: 'idle',
  getGroupStatus: 'idle',
  createGroupStatus: 'idle',
  updateGroupStatus: 'idle',
  deleteGroupStatus: 'idle',
  error: null,
  nextToken: null
}

export const listGroups = createAsyncThunk(
  'groups/list',
  async (params, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const response = await groupService.listGroups(accessToken, params || {})
      return response.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const getGroup = createAsyncThunk(
  'groups/getById',
  async (groupId, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const response = await groupService.getGroup(accessToken, groupId)
      return response.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const createGroup = createAsyncThunk(
  'groups/create',
  async (payload, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const response = await groupService.createGroup(accessToken, payload)
      return response.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const updateGroup = createAsyncThunk(
  'groups/update',
  async ({ groupId, payload }, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const response = await groupService.updateGroup(accessToken, groupId, payload)
      return response.data
    } catch (error) {
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const deleteGroup = createAsyncThunk(
  'groups/delete',
  async (groupId, thunkAPI) => {
    try {
      const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
      const response = await groupService.deleteGroup(accessToken, groupId)
      return response.data
    } catch (error) {
      console.log('RESSSSSSSSSSPON', error)
      const message = (
        error.response && error.response.data && error.response.data.error
      ) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    resetGroupState: (state) => {
      state.groups = []
      state.group = null
      state.listGroupsStatus = 'idle'
      state.getGroupStatus = 'idle'
      state.createGroupStatus = 'idle'
      state.updateGroupStatus = 'idle'
      state.deleteGroupStatus = 'idle'
      state.error = null
      state.nextToken = null
    },
    resetGroupStatus: (state) => {
      state.listGroupsStatus = 'idle'
      state.getGroupStatus = 'idle'
      state.createGroupStatus = 'idle'
      state.updateGroupStatus = 'idle'
      state.deleteGroupStatus = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      // listGroups
      .addCase(listGroups.pending, (state) => {
        state.listGroupsStatus = 'loading'
        state.error = null
      })
      .addCase(listGroups.fulfilled, (state, action) => {
        state.listGroupsStatus = 'succeeded'
        const payload = action.payload || {}
        state.groups = payload.items || payload.groups || []
        state.nextToken = payload.nextToken || null
      })
      .addCase(listGroups.rejected, (state, action) => {
        state.listGroupsStatus = 'failed'
        state.error = action.payload || action.error?.message
      })

      // getGroup
      .addCase(getGroup.pending, (state) => {
        state.getGroupStatus = 'loading'
        state.error = null
      })
      .addCase(getGroup.fulfilled, (state, action) => {
        state.getGroupStatus = 'succeeded'
        state.group = action.payload?.group || null
      })
      .addCase(getGroup.rejected, (state, action) => {
        state.getGroupStatus = 'failed'
        state.error = action.payload || action.error?.message
      })

      // createGroup
      .addCase(createGroup.pending, (state) => {
        state.createGroupStatus = 'loading'
        state.error = null
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.createGroupStatus = 'succeeded'
        const g = action.payload?.group
        if (g) {
          state.groups.unshift(g)
          state.group = g
        }
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.createGroupStatus = 'failed'
        state.error = action.payload || action.error?.message
      })

      // updateGroup
      .addCase(updateGroup.pending, (state) => {
        state.updateGroupStatus = 'loading'
        state.error = null
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.updateGroupStatus = 'succeeded'
        const g = action.payload?.group
        if (g) {
          state.group = g
          const idx = state.groups.findIndex(x => x.groupId === g.groupId)
          if (idx !== -1) {
            state.groups[idx] = g
          }
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.updateGroupStatus = 'failed'
        state.error = action.payload || action.error?.message
      })

      // deleteGroup
      .addCase(deleteGroup.pending, (state) => {
        state.deleteGroupStatus = 'loading'
        state.error = null
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.deleteGroupStatus = 'succeeded'
        const id = action.payload?.groupId
        if (id) {
          state.groups = state.groups.filter(g => g.groupId !== id)
          if (state.group?.groupId === id) {
            state.group = null
          }
        }
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.deleteGroupStatus = 'failed'
        state.error = action.payload || action.error?.message
      })
  }
})

export const { resetGroupState, resetGroupStatus } = groupsSlice.actions
export default groupsSlice.reducer
