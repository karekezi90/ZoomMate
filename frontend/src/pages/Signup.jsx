import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import OAuthButtons from '../components/OAuthButtons'
import TextInput from '../components/TextInput'
import ErrorMessage from '../components/ErrorMessage'
import { isValidEmail, validatePassword } from '../lib/validators'
import { signup } from '../features/auth/authSlice'

const Signup = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const { status, error, userAuth } = useSelector(state => state.auth)

    const [errorMessage, setErrorMessage] = useState('')
    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const {email, password } = form

    useEffect(() => {
        if (status === 'succeded') {
            navigate('/verify', { state: { email: userAuth?.delivery?.Destination },  replace: true })
        } else if (status === 'failed') (
            setErrorMessage(error)
        )
    }, [status, navigate])

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
        
        dispatch(signup({ email, password }))
    }

    return (
        <AuthLayout title='Create your ZoomMate account' subtitle='Join in seconds. No credit card required.'>
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
                    label='Password' 
                    type='password' 
                    name='password' 
                    value={password} 
                    onChange={onChange} 
                    placeholder='••••••••' autoComplete='new-password' 
                />
                <button type='submit' className='btn-primary w-full' disabled={status === 'loading'}>
                    {status === 'loading' ? 'Creating account…' : 'Sign up'}
                </button>
            </form>

            <div className='my-6 flex items-center gap-3 text-xs light:text-gray-500 dark:text-white-500'>
                <span className='h-px flex-1 bg-gray-200' /><span>or continue with</span><span className='h-px flex-1 bg-gray-200' />
            </div>

            <OAuthButtons
                disabled={status === 'loading'}
                onGoogle={
                    async () => { }
                }
                onFacebook={
                    async () => { }
                }
            />

            <p className='mt-6 text-center light:text-gray-600 dark:text-white-600'>
                Already have an account? <Link to='/login' className='text-brand-600 hover:underline'>Log in</Link>
            </p>
        </AuthLayout>
    )
}

export default Signup