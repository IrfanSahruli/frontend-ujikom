"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import HomePage from "../HomePage/page";

interface Notifikasi {
    id: number;
    message: string;
    isRead: boolean;
    postingan?: {
        konten?: string;
    };
}

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
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
            {notifikasi.length === 0 ? (
                <p className="text-gray-500">Tidak ada notifikasi</p>
            ) : (
                <div className="space-y-2">
                    {notifikasi.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-4 rounded-lg shadow-md cursor-pointer transition ${notif.isRead ? "bg-white" : "bg-blue-100"
                                }`}
                            onClick={() => handleReadNotification(notif.id)}
                        >
                            <p className="font-semibold">{notif.message}</p>
                            <p className="text-sm text-gray-500">{notif.postingan?.konten || "Postingan telah dihapus"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotifikasiPage;
