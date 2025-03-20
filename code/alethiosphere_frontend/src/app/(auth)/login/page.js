'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { login } from '@/app/(auth)/client-jwt';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    // Check for URL parameters on load
    useEffect(() => {
        const registered = searchParams.get('registered');
        const sessionExpired = searchParams.get('session_expired');
        const authRequired = searchParams.get('auth_required');

        if (registered === 'true') {
            setStatusMessage({
                type: 'success',
                text: 'Registration successful! Please login with your new account.'
            });
        } else if (sessionExpired === 'true') {
            setStatusMessage({
                type: 'warning',
                text: 'Your session has expired. Please login again.'
            });
        } else if (authRequired === 'true') {
            setStatusMessage({
                type: 'warning',
                text: 'Please login to access that page.'
            });
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});
        setStatusMessage('');

        try {
            // Use the login function from client-jwt.js
            const data = await login({
                email: formData.email,
                password: formData.password
            });

            if (!data.success) {
                setErrors({ form: data.message || 'Login failed. Please check your credentials.' });
                return;
            }

            // Login successful - redirect to home/dashboard
            router.push('/home');

        } catch (error) {
            console.error('Login error:', error);
            setErrors({ form: 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#55DBCB] to-[#189195]">
            {/* Left side with decorative elements */}
            <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-8">
                <div className="text-center mb-8">
                    <h1 className="font-[PoppinsFont] text-5xl font-bold text-[#453823] mb-4">AlethioSphere</h1>
                    <p className="text-xl text-white">Your AI companion for personal journaling</p>
                </div>
                <div className="relative">
                    <div className="bg-[#233855] p-4 rounded-lg shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300">
                        <Image
                            src="/images/landing_page_img.jpg"
                            alt="AI Avatar"
                            width={300}
                            height={350}
                            className="rounded-lg"
                            style={{objectFit: 'cover'}}
                        />
                        <div className="absolute -bottom-4 -right-4 bg-[#E5A134] text-[#453823] py-2 px-4 rounded-lg shadow-md text-sm font-bold">
                            Welcome Back!
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side with login form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                    <div className="mb-6 text-center">
                        <h1 className="font-[PoppinsFont] text-4xl font-bold text-[#453823] tracking-tight">Welcome Back!</h1>
                        <p className="mt-2 text-[#453823]">Enter your credentials to continue</p>
                    </div>

                    {statusMessage && (
                        <div className={`mb-4 p-3 rounded-md ${
                            statusMessage.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : statusMessage.type === 'warning'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                        }`}>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-[#453823] font-medium mb-2">Email
                                Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189195] text-[#453823]"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-[#453823] font-medium mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189195] text-[#453823]"
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-[#453823]">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-[#453823] py-3 font-[PoppinsFont] font-bold text-white shadow-md transition-all duration-300 hover:bg-[#3B290D] hover:shadow-lg"
                            >
                                Log In
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[#453823]">
                            Don&apos;t have an account?{" "}
                            <Link href="/register"
                                  className="font-semibold text-[#189195] hover:text-[#007B7F] transition-all duration-200">
                                Sign up now
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center justify-center text-[#453823] hover:text-[#3B290D] transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                                      clipRule="evenodd"/>
                            </svg>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}