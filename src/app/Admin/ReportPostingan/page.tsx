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
    const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);

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

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedLaporan) return;

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/laporkanPostingan/${selectedLaporan.id}`,
                { status: newStatus },
                { withCredentials: true }
            );

            setLaporan(prevLaporan => prevLaporan.map(lapor =>
                lapor.id === selectedLaporan.id ? { ...lapor, status: newStatus } : lapor
            ));

            setSelectedLaporan(null); // Tutup modal setelah update
        } catch (error) {
            console.error('Gagal memperbarui status laporan', error);
        }
    };

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
                            <th className="border px-4 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {laporan.length > 0 ? (
                            laporan.map((lapor) => (
                                <tr key={lapor.id} className="border">
                                    <td className="border px-4 py-2">{lapor.id}</td>
                                    <td className="border px-4 py-2">{lapor.user?.username}</td>
                                    <td className="border px-4 py-2">
                                        <img src={lapor.postingan?.foto ?? undefined} alt="Post" className="w-16 h-16" />
                                        <p>{lapor.postingan?.konten}</p>
                                    </td>
                                    <td className="border px-4 py-2">{lapor.alasan}</td>
                                    <td className="border px-4 py-2">{lapor.status}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => setSelectedLaporan(lapor)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                        >
                                            Edit Status
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-4">Tidak ada laporan</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup */}
            {selectedLaporan && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-3">Ubah Status Laporan</h2>
                        <p className="mb-4">Laporan dari <b>{selectedLaporan.user.username}</b> tentang postingan: </p>
                        <p className="mb-2">{selectedLaporan.postingan.konten}</p>

                        <label className="block font-medium mb-2">Pilih Status:</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={selectedLaporan.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                        </select>

                        <div className="flex justify-end mt-4">
                            <button
                                className="mr-2 px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setSelectedLaporan(null)}
                            >
                                Batal
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={() => handleStatusChange(selectedLaporan.status)}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportPostingan;
