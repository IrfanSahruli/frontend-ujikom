'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        noHp: '',
        role: '',
        fotoProfil: null as File | null, // Tambahkan tipe untuk foto profil
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, fotoProfil: file }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('noHp', formData.noHp);
        formDataToSend.append('role', formData.role);
        if (formData.fotoProfil) {
            formDataToSend.append('fotoProfil', formData.fotoProfil); // Tambahkan file foto profil
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/register`, // Ganti dengan URL backend Anda
                formDataToSend,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login...');
            router.push('/Login');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Terjadi kesalahan. Silahkan coba lagi.');
            } else {
                setError('Terjadi kesalahan yang tidak terduga. Silahkan coba lagi.');
            }
        }
    };

    return (
        <div className="flex items-center justify-start min-h-screen">
            <div className="bg-[#ffffff] p-8 border rounded-lg w-96 mt-6 mb-6 ml-24">
                <h1 className="text-[30px] font-bold text-center mb-6 text-black">Register</h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-black">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="mt-1  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#000000] focus:border-[#000000]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-black">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#000000] focus:border-[#000000]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="noHp" className="block text-sm font-medium text-black">
                            Nomor HP
                        </label>
                        <input
                            type="text"
                            id="noHp"
                            value={formData.noHp}
                            onChange={handleInputChange}
                            className="mt-1  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#000000] focus:border-[#000000]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-black">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="mt-1  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#000000] focus:border-[#000000]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="fotoProfil" className="block text-sm font-medium text-black">
                            Foto Profil
                        </label>
                        <input
                            type="file"
                            id="fotoProfil"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#000957] text-white py-2 rounded-md"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Sudah punya akun?{' '}
                    <Link href={"/Login"}>
                        <span className="text-[#000957] cursor-pointer underline">Login di sini</span>
                    </Link>
                </p>
            </div>
            <div className='ml-[350px] font-bold'>
                <p className='text-[60px] text-black'>Kick<span className='text-yellow-500'>Talk</span></p>
            </div>
        </div>
    );
}

export default Register;
