'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import SidebarAdmin from '@/app/components/SidebarAdmin';

type User = {
    id: number;
    username: string;
    email: string;
    noHp: number;
    fotoProfil?: string;
    role: string;
    status: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

function UserList() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('semua')

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        handleFilter()
    }, [filterStatus, users]);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, { withCredentials: true });

            if (res.data.role !== 'admin') {
                router.push('/Login'); // bukan admin
            } else {
                fetchUsers(); // lanjut ambil data dashboard
            }
        } catch (error) {
            router.push('/Login'); // belum login / token ga valid
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get<User[]>(`${apiUrl}/getUser`, { withCredentials: true });
            const filteredUsers = response.data.filter((user: User) => user.role === 'user');
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
        try {
            await axios.delete(`${apiUrl}/user/${id}`, { withCredentials: true });
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleFilter = () => {
        if (filterStatus === 'semua') {
            setFilteredUsers(users)
        } else {
            const result = users.filter((user) => user.status.toLowerCase() === filterStatus.toLowerCase())
            setFilteredUsers(result)
        }
    }

    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p className='text-xl font-semibold'>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarAdmin />

            <div className="flex-1 p-6">
                <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Daftar User</h1>

                    <div className="flex justify-end mb-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border px-3 py-2 rounded-md"
                        >
                            <option value="semua">Semua</option>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200 shadow-md rounded-md">
                                <thead>
                                    <tr className="bg-blue-600 text-white">
                                        <th className="border border-gray-300 p-3">ID</th>
                                        <th className="border border-gray-300 p-3">Username</th>
                                        <th className="border border-gray-300 p-3">Email</th>
                                        <th className="border border-gray-300 p-3">No HP</th>
                                        <th className="border border-gray-300 p-3">Status</th>
                                        <th className="border border-gray-300 p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, index) => (
                                            <tr key={user.id} className="text-center bg-white hover:bg-gray-100 transition">
                                                <td className="border border-gray-300 p-3">{index + 1}</td>
                                                <td className="border border-gray-300 p-3">{user.username}</td>
                                                <td className="border border-gray-300 p-3">{user.email}</td>
                                                <td className="border border-gray-300 p-3">{user.noHp}</td>
                                                <td
                                                    className={`border border-gray-300 p-3 font-semibold ${user.status === 'aktif' ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                >
                                                    {user.status}
                                                </td>
                                                <td className="border border-gray-300 p-3">
                                                    <Button variant="destructive" onClick={() => handleDelete(user.id)}>
                                                        Hapus
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-gray-500">
                                                Data tidak ditemukan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserList;
