'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import SidebarAdmin from '@/app/components/SidebarAdmin';

interface User {
    id: number;
    username: string;
    fotoProfil: string;
}

interface Postingan {
    id: number;
    caption: string;
    foto: string | null;
    statusPostingan: string;
    user: User;
}

interface Laporan {
    id: number;
    alasan: string;
    statusLaporan: string;
    user: User;
    postingan: Postingan;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

function ReportPostingan() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [laporan, setLaporan] = useState<Laporan[]>([]);
    const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
    const [selectedAction, setSelectedAction] = useState<"banned" | "tolak" | "">("");
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        checkAuth();
    }, [router]);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, { withCredentials: true });

            if (res.data.role !== 'admin') {
                router.push('/Login'); // bukan admin
            } else {
                fetchLaporanPostingan(); // lanjut ambil data dashboard
            }
        } catch (error) {
            router.push('/Login'); // belum login / token ga valid
        }
    };

    const fetchLaporanPostingan = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/laporkanPostingan`, {
                withCredentials: true,
            });

            setLaporan(response.data.laporan);
        } catch (error) {
            console.error('Gagal mengambil data laporan postingan', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (aksi: 'banned' | 'tolak') => {
        if (!selectedLaporan) return;

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/laporkanPostingan/${selectedLaporan.id}/tinjau`,
                { aksi }, // <- sesuaikan dengan backend
                { withCredentials: true }
            );

            // Update list laporan di frontend
            setLaporan(prevLaporan => prevLaporan.map(lapor =>
                lapor.id === selectedLaporan.id
                    ? {
                        ...lapor,
                        statusLaporan: 'resolved',
                        postingan: {
                            ...lapor.postingan,
                            statusPostingan: aksi === 'banned' ? 'non-aktif' : 'aktif'
                        }
                    }
                    : lapor
            ));

            setSelectedLaporan(null);
        } catch (error) {
            console.error('Gagal memperbarui status laporan', error);
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
        <div className="flex min-h-screen bg-gray-100">
            <SidebarAdmin />

            <div className="flex-1 p-6">
                <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Laporan Postingan</h1>
                    <div className="flex justify-end mb-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border px-3 py-2 rounded-md"
                        >
                            <option value="all">Semua</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
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
                                        <th className="border border-gray-300 p-3">Pelapor</th>
                                        <th className="border border-gray-300 p-3">Terlapor</th>
                                        <th className="border border-gray-300 p-3">Postingan</th>
                                        <th className="border border-gray-300 p-3">Status Postingan</th>
                                        <th className="border border-gray-300 p-3">Alasan</th>
                                        <th className="border border-gray-300 p-3">Status Laporan</th>
                                        <th className="border border-gray-300 p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {laporan.length > 0 ? (
                                        laporan.filter((lapor) => filterStatus === 'all' || lapor.statusLaporan === filterStatus).map((lapor, index) => (
                                            <tr key={lapor.id} className="text-center bg-white hover:bg-gray-100 transition">
                                                <td className="border border-gray-300 p-3">{index + 1}</td>
                                                <td className="border border-gray-300 p-3">{lapor.user?.username}</td>
                                                <td className="border border-gray-300 p-3">{lapor.postingan.user?.username}</td>
                                                <td className="border border-gray-300 p-3">
                                                    <div className="flex flex-col items-center">
                                                        {lapor.postingan?.foto && (
                                                            <img
                                                                src={`${apiUrl}${lapor.postingan?.foto}`}
                                                                alt={`Foto ${lapor.postingan?.id}`}
                                                                className="w-[120px] h-[120px] rounded-md mt-2 object-cover"
                                                            />
                                                        )}
                                                        <p className="mt-2 text-sm text-gray-700">{lapor.postingan?.caption}</p>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 p-3 font-semibold text-green-600">{lapor.postingan?.statusPostingan}</td>
                                                <td className="border border-gray-300 p-3">{lapor.alasan}</td>
                                                <td className="border border-gray-300 p-3 font-semibold text-blue-600">{lapor.statusLaporan}</td>
                                                <td className="border border-gray-300 p-3">
                                                    <Button onClick={() => setSelectedLaporan(lapor)} disabled={lapor.statusLaporan === 'resolved'} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-transform hover:scale-105">
                                                        Tinjau
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

            {selectedLaporan && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Ubah Status Laporan</h2>
                        <p className="mb-4">Laporan dari <b>{selectedLaporan.user.username}</b> tentang postingan:</p>
                        <p className="mb-2">{selectedLaporan.postingan.caption}</p>

                        <label className="block font-medium mb-2">Pilih Status:</label>
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value as "banned" | "tolak")}
                            className="border rounded p-2 w-full"
                        >
                            <option value="" disabled>Pilih aksi</option>
                            <option value="banned">Banned Postingan</option>
                            <option value="tolak">Tolak Laporan</option>
                        </select>

                        <div className="flex justify-end mt-4">
                            <button className="mr-2 px-4 py-2 bg-gray-300 rounded" onClick={() => setSelectedLaporan(null)}>
                                Batal
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={() => {
                                    if (!selectedAction) {
                                        alert("Silahkan pilih aksi terlebih dahulu!");
                                        return;
                                    }
                                    handleStatusChange(selectedAction);
                                }}
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
