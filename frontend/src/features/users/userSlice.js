import {
    createSlice, 
    createAsyncThunk
} from '@reduxjs/toolkit'
import userService from './userService'

const initialState = {
    users: [],
    user: null,
    error: null,
    getUserStatus: 'idle',
    getUsersStatus: 'idle',
    updateUserStatus: 'idle',
    searchUsersStatus: 'idle',
    searchedUsers: [],
}

export const getUser = createAsyncThunk(
    'user/me',
    async (authenticatedUserData, thunkAPI) => {
        try {
            const accessToken = thunkAPI.getState().auth?.authenticatedUserData?.accessToken
            const response =  await userService.getUser(accessToken || authenticatedUserData.accessToken)
            return response.data?.user
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const updateUser = createAsyncThunk(
    'user/updateMe',
    async (payload, thunkAPI) => {
        try {
            const accessToken = thunkAPI.getState().auth.authenticatedUserData.accessToken
            const response =  await userService.updateUser(accessToken, payload)
            return response.data
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const getUsers = createAsyncThunk(
    'user/users',
    async (_, thunkAPI) => {
        try {
            const accessToken = thunkAPI.getState().auth.authenticatedUserData.accessToken
            const response =  await userService.getUsers(accessToken)
            return response.data.items
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const searchUsers = createAsyncThunk(
    'user/searchUsers',
    async (payload, thunkAPI) => {
        try {
            const accessToken = thunkAPI.getState().auth.authenticatedUserData.accessToken
            const response =  await userService.searchUsers(accessToken, payload)
            return response.data
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        resetUser: (state) => {
            state.getUserStatus = 'idle'
            state.getUsersStatus = 'idle'
            state.updateUserStatus = 'idle'
            state.searchUsersStatus = 'idle'
            state.error = null
            state.user = null
            state.users = []
            state.searchedUsers = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUser.pending, (state) => {
                state.getUserStatus = 'loading'
                state.error = null
                state.user = null
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.getUserStatus = 'succeeded'
                state.error = null
                state.user = action.payload
            })
            .addCase(getUser.rejected, (state, action) => {
                state.getUserStatus = 'failed'
                state.error = action.payload || 'Failed to get user' 
                state.user = null
            })

            .addCase(updateUser.pending, (state) => {
                state.updateUserStatus = 'loading'
                state.error = null
                state.user = null
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.updateUserStatus = 'succeeded'
                state.error = null
                state.user = action.payload
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.updateUserStatus = 'failed'
                state.error = action.payload || 'Failed to update user' 
                state.user = null
            })

            .addCase(getUsers.pending, (state) => {
                state.getUsersStatus = 'loading'
                state.error = null
                state.users = []
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.getUsersStatus = 'succeeded'
                state.error = null
                state.users = action.payload
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.getUsersStatus = 'failed'
                state.error = action.payload || 'Failed to get users' 
                state.users = []
            })

            .addCase(searchUsers.pending, (state) => {
                state.searchUsersStatus = 'loading'
                state.error = null
                state.searchedUsers = null
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.searchUsersStatus = 'succeeded'
                state.error = null
                state.searchedUsers = action.payload
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.searchUsersStatus = 'failed'
                state.error = action.payload || 'Failed to get user' 
                state.searchedUsers = null
            })
    }
})

export const { resetUser } = userSlice.actions
export default userSlice.reducer
