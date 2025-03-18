'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { LayoutDashboard, Flag, LogOut, User } from 'lucide-react';

function SidebarAdmin() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/logout`, { withCredentials: true });
            router.push('/Login');
        } catch (error) {
            console.error('Logout gagal', error);
        }
    };

    return (
        <>
            <div className="h-screen w-[250px] bg-white shadow-lg text-black flex flex-col sticky top-0 border-r">
                {/* Logo */}
                <div className="p-5 text-2xl font-bold border-b text-center bg-white text-black">
                    Kick<span className="text-yellow-500">Talk</span>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-4">
                    <SidebarItem href="/Admin/Dashboard" icon={<LayoutDashboard size={24} />} label="Dashboard" />
                    <SidebarItem href="/Admin/ReportPostingan" icon={<Flag size={24} />} label="Laporan Postingan" />
                    <SidebarItem href="/Admin/UserList" icon={<User size={24} />} label="User" />
                </nav>

                {/* Tombol Logout */}
                <div className="p-4 border-t mt-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center space-x-3 text-red-600 hover:bg-red-100 p-3 rounded-md transition">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            {/* Modal Konfirmasi Logout */}
            {isModalOpen && (
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <Dialog.Title className="text-lg font-semibold text-gray-800">
                            Konfirmasi Logout
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-600 mt-2">
                            Apakah Anda yakin ingin logout?
                        </Dialog.Description>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                                Batal
                            </button>
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                                Ya, Logout
                            </button>
                        </div>
                    </Dialog.Panel>
                </Dialog>
            )}
        </>
    );
}

const SidebarItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
    <Link href={href} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition">
        {icon}
        <span className="text-lg">{label}</span>
    </Link>
);

export default SidebarAdmin;
