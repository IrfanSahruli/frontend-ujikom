'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

function Sidebar() {
    const [user, setUser] = useState<{ id: number; username: string; fotoProfil: string | null } | null>(null);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, {
                withCredentials: true,
            });
            setUser(response.data); // Pastikan response sesuai
        } catch (error) {
            console.error('Gagal mengambil data user', error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div className="h-screen w-[236px] bg-[#ffffff] text-white flex flex-col sticky top-0 border-e">
            {/* Logo */}
            <div className="p-4 text-2xl font-bold border-b text-center">
                <p className="text-black">Kick<span className="text-yellow-600">Talk</span></p>
            </div>

            {/* Menu */}
            <nav className="flex-1">
                <ul className="p-4 space-y-4">
                    <li className='flex hover:bg-gray-50 h-[40px] rounded-md items-center'>
                        <img src="/image/home.svg" alt="logo home" className='w-[28px] h-[28px] ml-3' />
                        <Link href="/User/HomePage" className="block py-1 px-2 rounded text-black">
                            Home
                        </Link>
                    </li>
                    <li className='flex hover:bg-gray-50 h-[40px] rounded-md items-center'>
                        <img src="/image/message.svg" alt="logo notifikasi" className='w-[28px] h-[28px] ml-3' />
                        <Link href="/User/Notifikasi" className="block py-1 px-2 rounded text-black">
                            Notifikasi
                        </Link>
                    </li>
                    <li className='flex hover:bg-gray-50 h-[40px] rounded-md items-center'>
                        {user ? (
                            <div className='flex text-center ml-3'>
                                <img
                                    src={user.fotoProfil ? `${apiUrl}${user.fotoProfil}` : "/default-avatar.png"}
                                    alt="Avatar"
                                    className="w-[30px] h-[30px] rounded-full object-cover border-[2px] border-black"
                                />
                                <Link href='/User/Profil' className='text-black ml-2 mt-1'>Profil</Link>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                                <div className="w-20 h-4 mt-2 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
