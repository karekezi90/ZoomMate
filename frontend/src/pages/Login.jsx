import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import OAuthButtons from '../components/OAuthButtons'
import TextInput from '../components/TextInput'
import ErrorMessage from '../components/ErrorMessage'
import { isValidEmail, validatePassword } from '../_utitls'
import { login } from '../features/auth/authSlice'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { loginStatus, error } = useSelector(state => state.auth)

    const [errorMessage, setErrorMessage] = useState('')
    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const {email, password } = form

    useEffect(() => {
        if (loginStatus === 'succeeded') {
            navigate('/profile', {  replace: true })
        } if (loginStatus === 'failed') (
            setErrorMessage(error)
        )
    }, [loginStatus, navigate])

    const onChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')

        const { isValid, error } = validatePassword(password)
        
        if (!isValidEmail(email)) {
            return setErrorMessage('Please enter a valid email address.')
        }
        if (!isValid) {
            return setErrorMessage(error)
        }
        
        dispatch(login({ email, password }))
    }

    return (
        <AuthLayout title='Welcome back' subtitle='Log in to access your profile and connect with like-minded people.'>
            <ErrorMessage message={errorMessage} />

            <form onSubmit={onSubmit} className='space-y-4'>
                <TextInput 
                    id='email' 
                    label='Email' 
                    type='email' 
                    name='email' 
                    value={email} 
                    onChange={onChange} 
                    autoComplete='email' 
                    placeholder='you@example.com' 
                />
                <TextInput 
                    id='password' 
                    type='password' 
                    name='password' 
                    label='Password' 
                    value={password} 
                    onChange={onChange} 
                    placeholder='••••••••' 
                    autoComplete='current-password' 
                />
                <button 
                    type='submit' 
                    className='btn-primary w-full' 
                    disabled={loginStatus === 'loading'}
                >
                    {loginStatus === 'loading' ? 'Signing in…' : 'Log in'}
                </button>
            </form>

            <div className='my-6 flex items-center gap-3 text-xs light:text-gray-500 dark:text-white-500'>
                <span className='h-px flex-1 bg-gray-200' /><span>or continue with</span><span className='h-px flex-1 bg-gray-200' />
            </div>

            <OAuthButtons
                disabled={loginStatus === 'loading'}
                onGoogle={
                    async () => { }
                }
                onFacebook={
                    async () => { }
                }
            />

            <p className='mt-6 text-center text-sm light:text-gray-600 dark:text-white-600'>
                New to ZoomMate? <Link to='/signup' className='text-brand-600 hover:underline'>Create an account</Link>
            </p>
        </AuthLayout>
    )
}

export default Login
