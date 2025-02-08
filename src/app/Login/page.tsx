'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/login`,
                formData,
                { withCredentials: true }
            );

            console.log("Respons dari server:", response.data);

            const userRole = response.data.user.role; // Pastikan akses ke role user
            const token = response.data.token;

            // Simpan token di localStorage
            localStorage.setItem('token', token);

            // Validasi role
            if (userRole === 'admin') {
                router.push('/Admin/HomePage');
            } else if (userRole === 'user') {
                router.push('/User/HomePage');
            } else {
                setError('Role tidak valid'); // Jika role tidak sesuai
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Terjadi kesalahan. Silahkan coba lagi.');
        }
    };

    return (
        <div className='flex items-center justify-end min-h-screen mr-24'>
            <div className='mr-[350px] font-bold'>
                <p className='text-[60px] text-black'>
                    Kick<span className='text-yellow-500'>Talk</span>
                </p>
            </div>
            <div className='bg-[#ffffff] p-8 shadow-2xl rounded-lg w-96'>
                <h1 className='text-[30px] font-bold text-center mb-6 text-[#000957]'>Login</h1>
                {error && <p className='text-red-500 text-center mb-4'>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label htmlFor='username' className='block text-sm font-medium text-[#000957]'>
                            Username
                        </label>
                        <input
                            type='text'
                            id='username'
                            value={formData.username}
                            onChange={handleInputChange}
                            className='mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#000957] focus:border-[#000957]'
                        />
                    </div>
                    <div className='mb-4'>
                        <label htmlFor='password' className='block text-sm font-medium text-[#000957]'>
                            Password
                        </label>
                        <input
                            type='password'
                            id='password'
                            value={formData.password}
                            onChange={handleInputChange}
                            className='mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#000957] focus:border-[#000957]'
                        />
                    </div>
                    <button
                        type='submit'
                        className='w-full bg-[#000957] text-white py-2 rounded-md hover:bg-[#000957] transition duration-200'
                    >
                        Login
                    </button>
                </form>
                <p className='mt-4 text-center'>
                    Belum punya akun?{' '}
                    <Link href='/Register'>
                        <span className='text-[#000957] cursor-pointer underline'>Daftar di sini</span>
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
