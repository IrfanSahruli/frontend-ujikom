'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SidebarAdmin() {
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
                        <Link href="/Admin/Dashboard" className="block py-1 px-2 rounded text-black">
                            Dashboard
                        </Link>
                    </li>
                    <li className='flex hover:bg-gray-50 h-[40px] rounded-md items-center'>
                        <img src="/image/message.svg" alt="logo notifikasi" className='w-[28px] h-[28px] ml-3' />
                        <Link href="/Admin/" className="block py-1 px-2 rounded text-black">
                            Notifikasi
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default SidebarAdmin
