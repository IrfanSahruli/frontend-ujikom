"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/app/components/Sidebar";

interface Notifikasi {
    id: number;
    message: string;
    isRead: boolean;
    postingan?: {
        konten?: string;
    };
    komentar?: {
        user: {
            fotoProfil: string | null;
            username: string;
        };
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

function NotifikasiPage() {
    const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifikasi`, {
            withCredentials: true
        })
            .then((res) => setNotifikasi(res.data.notifikasi))
            .catch((err) => console.error("Error fetching notifications:", err));
    }, []);

    const handleReadNotification = async (id: number) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifikasi/${id}`, {}, {
                withCredentials: true
            });

            setNotifikasi((prev) =>
                prev.map((notif) => notif.id === id ? { ...notif, isRead: true } : notif)
            );
        } catch (error) {
            console.error("Error updating notification:", error);
        }
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Konten Notifikasi */}
            <div className="mx-auto p-4 ml-5 flex-1">
                <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
                {notifikasi.length === 0 ? (
                    <p className="text-gray-500">Tidak ada notifikasi</p>
                ) : (
                    <div className="space-y-2 w-[800px]">
                        {notifikasi.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-lg shadow-md cursor-pointer transition ${notif.isRead ? "bg-white" : "bg-blue-100"
                                    }`}
                                onClick={() => handleReadNotification(notif.id)}
                            >
                                <div className="flex items-center">
                                    {/* Foto Profil dan Nama Pengguna yang Memberikan Komentar */}
                                    {notif.komentar?.user && (
                                        <div className="flex items-center">
                                            <img
                                                src={notif.komentar.user.fotoProfil ? `${apiUrl}${notif.komentar.user.fotoProfil}` : "/default-avatar.png"}
                                                alt="Foto Profil"
                                                className="w-[40px] h-[40px] rounded-full object-cover mr-3"
                                            />
                                            <p className="font-semibold">{notif.message}</p> {/* Ini akan tetap menampilkan pesan */}
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-gray-500">{notif.postingan?.konten || "Postingan telah dihapus"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotifikasiPage;
