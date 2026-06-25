import React, { useContext, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import assets from '../assets/assets'
import { AuthContext } from '../context/authContext'

const loginSchema = z.object({
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
    agree: z.boolean().refine((value) => value, { message: 'You must agree to continue' }),
})

const signupStepOneSchema = z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
    agree: z.boolean().refine((value) => value, { message: 'You must agree to continue' }),
})

const signupStepTwoSchema = z.object({
    bio: z.string().trim().min(1, 'Bio is required'),
    agree: z.boolean().refine((value) => value, { message: 'You must agree to continue' }),
})

const LoginPage = () => {
    const [currentState, setCurrentState] = useState('Sign up')
    const [isDataSubmitted, setIsDataSubmitted] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { login } = useContext(AuthContext)

    const currentSchema = currentState === 'Sign up' && !isDataSubmitted
        ? signupStepOneSchema
        : currentState === 'Sign up' && isDataSubmitted
            ? signupStepTwoSchema
            : loginSchema

    const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
} = useForm({
    shouldUnregister: false,
    resolver: zodResolver(currentSchema),
    defaultValues: {
        fullName: '',
        email: '',
        password: '',
        bio: '',
        agree: false,
    },
})

   const onSubmitHandler = (data) => {

    if (currentState === 'Sign up' && !isDataSubmitted) {
        setIsDataSubmitted(true)
        return
    }

    if (currentState === 'Sign up') {

        const formData = getValues()

        console.log('Signup Data:', formData)

        login('signup', {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            bio: formData.bio,
        })

        return
    }

    login('login', {
        email: data.email,
        password: data.password,
    })
}

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
            {/* left */}
            <img src={assets.logo_big} alt="logo" className='w-[min(30vw,250px)]' />
            {/* right */}
            <form onSubmit={handleSubmit(onSubmitHandler)} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg' action="">
                <h2 className='flex justify-between items-center font-medium text-2xl'>
                    {currentState}
                    {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="arrow" className='cursor-pointer w-5' />}
                </h2>

                {currentState === 'Sign up' && !isDataSubmitted && (
                    <div className='w-full'>
                        <input
                            {...register('fullName')}
                            type="text"
                            placeholder='Full Name'
                            className='w-full p-2 border border-gray-500 rounded-md focus:outline-none'
                        />
                        {errors.fullName && <p className='mt-1 text-xs text-red-500'>{errors.fullName.message}</p>}
                    </div>
                )}

                {!isDataSubmitted && (
                    <>
                        <div className='w-full'>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder='Email Address'
                                className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
                            />
                            {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>}
                        </div>
                        <div className='relative'>
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Password'
                                className='w-full p-2 pr-10 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword((prev) => !prev)}
                                className='absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200'
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M3.98 8.223A10.477 10.477 0 001.5 12c1.57 3.397 4.77 6 10.5 6 1.93 0 3.61-.38 5.06-1.08M6.53 6.53A10.48 10.48 0 0112 5.5c5.73 0 8.93 2.603 10.5 6a10.47 10.47 0 01-2.14 3.11M9.88 14.12A3 3 0 0114.12 9.88' />
                                    </svg>
                                ) : (
                                    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12s-3.5 6.75-9.75 6.75S2.25 12 2.25 12z' />
                                        <circle cx='12' cy='12' r='3' />
                                    </svg>
                                )}
                            </button>
                            {errors.password && <p className='mt-1 text-xs text-red-500'>{errors.password.message}</p>}
                        </div>
                    </>
                )}

                {currentState === 'Sign up' && isDataSubmitted && (
                    <div>
                        <textarea
                            {...register('bio')}
                            rows={4}
                            className='w-full p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            placeholder='Provide a brief bio'
                        ></textarea>
                        {errors.bio && <p className='mt-1 text-xs text-red-500'>{errors.bio.message}</p>}
                    </div>
                )}

                <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                    {currentState === 'Sign up' ? 'Create Account' : 'Login Now'}
                </button>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <input
                        {...register('agree')}
                        type='checkbox'
                        className='cursor-pointer'
                    />
                    <p>Agree to the terms of use & Privacy Policy</p>
                </div>
                {errors.agree && <p className='-mt-4 text-xs text-red-500'>{errors.agree.message}</p>}
                <div className='flex flex-col gap-2'>
                    {currentState === 'Sign up' ? (
                        <p className='text-sm text-gray-600'>Already have an account? <span onClick={() => { setCurrentState('Login'); setIsDataSubmitted(false) }} className='cursor-pointer font-medium text-violet-500'>Login</span></p>
                    ) : (
                        <p className='text-sm text-gray-600'>Create an account? <span onClick={() => setCurrentState('Sign up')} className='cursor-pointer font-medium text-violet-500'>Sign Up</span></p>
                    )}
                </div>
            </form>
        </div>
    )
}

export default LoginPage