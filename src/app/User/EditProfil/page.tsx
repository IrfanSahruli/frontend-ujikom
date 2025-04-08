'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import axios from 'axios';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

function EditProfil() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [userData, setUserData] = useState<{
        username: string;
        email: string;
        noHp: string;
        fotoProfil: string;
    } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, {
                    withCredentials: true,
                });

                if (res.data.role !== 'user') {
                    router.push('/Login'); // bukan admin
                } else {
                    setLoading(false);
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, { withCredentials: true })
                        .then(response => {
                            setUserData({
                                username: response.data.username ?? '',
                                email: response.data.email ?? '',
                                noHp: response.data.noHp ?? '',
                                fotoProfil: response.data.fotoProfil ?? ''
                            });
                        })
                        .catch(error => console.error('Error mengambil data user:', error));
                }
            } catch (error) {
                router.push('/Login'); // token invalid / belum login
            }
        };

        checkAuth();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!userData) return;
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('username', userData?.username ?? '');
        formData.append('email', userData?.email ?? '');
        formData.append('noHp', userData?.noHp ?? '');
        if (selectedFile) {
            formData.append('fotoProfil', selectedFile);
        }

        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (selectedFile) {
                setUserData((prevData) => prevData ? {
                    ...prevData,
                    fotoProfil: URL.createObjectURL(selectedFile)
                } : null);
            }

            alert(response.data.message);
            router.push('/User/Profile');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p className='text-xl font-semibold'>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="relative ml-28 mt-10 p-8 bg-white shadow-lg rounded-lg w-[800px] mx-auto">
                <button
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-300 transition"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={24} />
                </button>

                <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">Edit Profil</h1>

                <div className="flex flex-col items-center">
                    <img
                        src={userData?.fotoProfil ? `${apiUrl}${userData.fotoProfil}` : "/default-avatar.png"}
                        alt="Foto Profil"
                        className="rounded-full border w-[150px] h-[150px] shadow-md object-cover"
                    />

                    <label className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer transition">
                        Pilih Foto
                        <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="mt-6">
                    <div className="mb-4">
                        <label className="block text-lg font-semibold text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={userData?.username ?? ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData?.email ?? ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 transition"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg font-semibold text-gray-700">No Hp</label>
                        <input
                            type="text"
                            name="noHp"
                            value={userData?.noHp ?? ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 transition"
                        />
                    </div>

                    {/* Modal Konfirmasi */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
                            >
                                Simpan Perubahan
                            </button>
                        </DialogTrigger>

                        <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-gray-800">Konfirmasi Perubahan</DialogTitle>
                                <p className="text-sm text-gray-500">Apakah Anda yakin ingin menyimpan perubahan ini?</p>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end space-x-3">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300">
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => { setIsDialogOpen(false); handleSubmit(); }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </form>
            </div>
        </div>
    );
}

export default EditProfil;
