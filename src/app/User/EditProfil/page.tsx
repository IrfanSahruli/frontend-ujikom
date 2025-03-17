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
    const router = useRouter();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        noHp: '',
        fotoProfil: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State untuk modal

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, { withCredentials: true })
            .then(response => {
                setUserData({
                    username: response.data.username,
                    email: response.data.email,
                    noHp: response.data.noHp,
                    fotoProfil: response.data.fotoProfil
                });
            })
            .catch(error => console.error('Error mengambil data user:', error));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('username', userData.username);
        formData.append('email', userData.email);
        formData.append('noHp', userData.noHp);
        if (selectedFile) {
            formData.append('fotoProfil', selectedFile);
        }

        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (selectedFile) {
                setUserData((prevData) => ({
                    ...prevData,
                    fotoProfil: URL.createObjectURL(selectedFile)
                }));
            }

            alert(response.data.message);
            router.push('/User/Profile');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className='relative ml-28 mt-5 mb-5 border rounded-md w-[800px] text-center p-6'>
                <button
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 transition"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={24} />
                </button>

                <h1 className='mt-2 font-bold text-[30px]'>Edit Profile</h1>

                <img
                    src={userData.fotoProfil ? `${apiUrl}${userData.fotoProfil}` : "/default-avatar.png"}
                    alt="Foto Profil"
                    className='rounded-full border w-[200px] h-[200px] mx-auto mt-10'
                />

                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='mb-4 mt-7'>
                        <label className='block text-[20px] font-medium text-black'>Foto Profil</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>

                    <div className='mb-4 mt-7'>
                        <label className='block text-[20px] font-medium text-black'>Username</label>
                        <input
                            type='text'
                            name='username'
                            value={userData.username}
                            onChange={handleChange}
                            className='mt-1 block w-[500px] px-3 py-2 border rounded-md mx-auto'
                        />
                    </div>

                    <div className='mb-4 mt-7'>
                        <label className='block text-[20px] font-medium text-black'>Email</label>
                        <input
                            type='email'
                            name='email'
                            value={userData.email}
                            onChange={handleChange}
                            className='mt-1 block w-[500px] px-3 py-2 border rounded-md mx-auto'
                        />
                    </div>

                    <div className='mb-4 mt-7'>
                        <label className='block text-[20px] font-medium text-black'>No Hp</label>
                        <input
                            type='text'
                            name='noHp'
                            value={userData.noHp}
                            onChange={handleChange}
                            className='mt-1 block w-[500px] px-3 py-2 border rounded-md mx-auto'
                        />
                    </div>

                    {/* Button untuk membuka modal */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <button type="button" className='mt-5 mb-3 rounded-md border w-[150px] p-2 bg-blue-500 text-white'>
                                Simpan Perubahan
                            </button>
                        </DialogTrigger>

                        {/* Modal Konfirmasi */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Konfirmasi Perubahan</DialogTitle>
                                <p className="text-sm text-gray-500">Apakah Anda yakin ingin menyimpan perubahan ini?</p>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                                <Button onClick={() => { setIsDialogOpen(false); handleSubmit(); }}>
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </form>
            </div>
        </div>
    )
}

export default EditProfil;
