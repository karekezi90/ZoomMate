import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit'
import authService from './authService'

const authenticatedUserData = JSON.parse(localStorage.getItem('auth'))

const initialState = {
    userAuth: null,
    status: 'idle',
    error: null,
    authenticatedUserData: authenticatedUserData ?? null
}

export const signup = createAsyncThunk(
    'auth/signup',
    async (payload, thunkAPI) => {
        try {
            const response =  await authService.signup(payload)
            return response.data
        } catch (error) {
            console.log('RESPONSE', error)
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const confirm = createAsyncThunk(
    'auth/confirm',
    async (payload, thunkAPI) => {
        try {
            const response = await authService.confirm(payload)
            return response.data
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const resendCode = createAsyncThunk(
    'auth/resendCode',
    async (payload, thunkAPI) => {
        try {
            const response = await authService.resendCode(payload)
            return response.data
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const login = createAsyncThunk(
    'auth/login',
    async (payload, thunkAPI) => {
        try {
            const response = await authService.login(payload)
            localStorage.setItem('auth', JSON.stringify(response.data))
            return response.data
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const deleteSelf = createAsyncThunk(
    'auth/deleteSelf',
    async (payload, thunkAPI) => {
        try {
            const response = await authService.deleteSelf(payload)
            localStorage.removeItem('auth')
            return response.data
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (payload, thunkAPI) => {
        try {
            const response = await authService.logout(payload)
            localStorage.removeItem('auth')
            return response.data
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.error
            ) || error.message || error.toString()

            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuth: (state) => {
            state.status = 'idle'
            state.error = null
            state.userAuth = null
            state.authenticatedUserData = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state) => {
                state.status = 'loading'
                state.error = null
                state.userAuth = null
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.status = 'succeded'
                state.error = null
                state.userAuth = action.payload
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || 'Signup failed' 
                state.userAuth = null
            })

            .addCase(confirm.pending, (state) => {
                state.status = 'loading'
                state.error = null
                state.userAuth = null
            })
            .addCase(confirm.fulfilled, (state, action) => {
                state.status = 'succeded'
                state.error = null
                state.userAuth = action.payload
            })
            .addCase(confirm.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || 'Confirm Signup failed' 
                state.userAuth = null
            })

            .addCase(resendCode.pending, (state) => {
                state.status = 'loading'
                state.error = null
                state.userAuth = null
            })
            .addCase(resendCode.fulfilled, (state, action) => {
                state.status = 'succeded'
                state.error = null
                state.userAuth = action.payload
            })
            .addCase(resendCode.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || 'Resend Code failed' 
                state.userAuth = null
            })

            .addCase(login.pending, (state) => {
                state.status = 'loading'
                state.error = null
                state.userAuth = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeded'
                state.error = null
                state.userAuth = action.payload
                state.authenticatedUserData = action.payload
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || 'Login failed' 
                state.userAuth = null
            })

            .addCase(deleteSelf.pending, (state) => {
                state.status = 'loading'
                state.error = null
                state.userAuth = null
            })
            .addCase(deleteSelf.fulfilled, (state, action) => {
                state.status = 'succeded'
                state.error = null
                state.userAuth = action.payload
            })
            .addCase(deleteSelf.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || 'Delete self failed' 
                state.userAuth = null
            })

            .addCase(logout.pending, (state) => {
                state.status = 'loading'
                state.error = null
                state.userAuth = null
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.status = 'succeded'
                state.error = null
                state.userAuth = action.payload
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || 'Logout failed' 
                state.userAuth = null
            })
    }
})

export const { resetAuth } = authSlice.actions
export default authSlice.reducer

