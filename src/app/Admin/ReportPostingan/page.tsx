'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '@/app/components/SidebarAdmin';

interface User {
    id: number;
    username: string;
    fotoProfil: string;
}

interface Postingan {
    id: number;
    konten: string;
    foto: string | null;
    user: User;
}

interface Laporan {
    id: number;
    alasan: string;
    status: string;
    user: User;
    postingan: Postingan;
}


function ReportPostingan() {
    const [laporan, setLaporan] = useState<Laporan[]>([]);

    const fetchLaporanPostingan = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/laporkanPostingan`, {
                withCredentials: true,
            });
            setLaporan(response.data.laporan);
        } catch (error) {
            console.error('Gagal mengambil data laporan postingan', error);
        }
    };

    useEffect(() => {
        fetchLaporanPostingan();
    }, []);

    return (
        <div className="flex min-h-screen">
            <SidebarAdmin />

            <div className='ml-10 mt-5'>
                <h1 className="text-2xl font-bold mb-4">Laporan Postingan</h1>
                <table className="w-[1000px] mb-5 bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">ID</th>
                            <th className="border px-4 py-2">Username</th>
                            <th className="border px-4 py-2">Postingan</th>
                            <th className="border px-4 py-2">Alasan</th>
                            <th className="border px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {laporan.length > 0 ? (
                            laporan.map((lapor, index) => (
                                <tr key={index} className="border">
                                    <td className="border px-4 py-2">{lapor.id}</td>
                                    <td className="border px-4 py-2">{lapor.user?.username}</td>
                                    <td className="border px-4 py-2">
                                        <img src={lapor.postingan?.foto ?? undefined} alt="Post" className="w-16 h-16" />
                                        <p>{lapor.postingan?.konten}</p>
                                    </td>
                                    <td className="border px-4 py-2">{lapor.alasan}</td>
                                    <td className="border px-4 py-2">{lapor.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4">Tidak ada laporan</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ReportPostingan;
