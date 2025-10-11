import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import TextInput from '../components/TextInput'
import ErrorMessage from '../components/ErrorMessage'
import { resendCode, confirm } from '../features/auth/authSlice'

const VerifyCode = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()

    const [errorMessage, setErrorMessage] = useState('')
    const [info, setInfo] = useState('')

    const { status, error, userAuth } = useSelector(state => state.auth)

    const [form, setForm] = useState({
        email: '',
        code: ''
    })

    const {email, code } = form

    useEffect(()=>{
        const e = location.state?.email 
        if (!e) {
            setInfo('Enter your email and the 6‑digit code you received to verify your account.')
        } else {
            setInfo(`We emailed a 6‑digit code to ${e}.`)
        }
    }, [location.state])

    useEffect(() => {
        if (status === 'succeded') {
            if (userAuth && userAuth?.message === 'Confirmation code resent') {
                setInfo(`A 6‑digit code is resent to: ${email}.`)
            } else if (userAuth && userAuth?.message === 'Email verified') {
                navigate('/login', { replace: true })
            }
        } else if (status === 'failed') (
            setErrorMessage(error)
        )
    }, [status, navigate])


    const onSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        if (!email) {
            return setErrorMessage('Email is required.')
        }

        if (!code || String(code).length !== 6) 
        {
            return setErrorMessage('Please enter the 6‑digit code.')
        }

        dispatch(confirm({ email, code }))
    }

    const onChange = (e) => {
        const { name, value } = e.target
        const val = name === code ? value.replace(/[^0-9]/g,'') : value
        setForm((prev) => ({
            ...prev,
            [name]: val
        }))
    }

    const handleResendCode = () => {
        setErrorMessage('')
        if (!email) {
            return setErrorMessage('Email is required.')
        }

        dispatch(resendCode({ email }))
    }

    return (
        <AuthLayout title='Verify your email' subtitle={info}>
            <ErrorMessage message={errorMessage} />

            <form onSubmit={onSubmit} className='space-y-4'>
                <TextInput 
                    id='email' 
                    type='email' 
                    label='Email' 
                    value={email} 
                    name='email'
                    autoComplete='email' 
                    onChange={onChange} 
                    placeholder='you@example.com' 
                />
                <TextInput 
                    id='code' 
                    type='text' 
                    name='code'
                    value={code} 
                    onChange={onChange} 
                    placeholder='123456' 
                    label='Verification code' 
                />

                <button type='submit' className='btn-primary w-full' disabled={status === 'loading'}>
                    {status === 'loading' ? 'Verifying…' : 'Verify & Continue'}
                </button>
            </form>

            <p className='mt-6 text-center text-sm light:text-gray-600 dark:text-white-600'>
                <Link to='/signup' className='text-brand-600 hover:underline'>Go back</Link>
                &nbsp; Didn’t get a code? &nbsp;
                <a href='#' onClick={handleResendCode} className='text-brand-600 hover:underline'>Resend Code</a>
            </p>
        </AuthLayout>
    )
}

export default VerifyCode