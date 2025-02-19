'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '@/app/components/Sidebar';
import moment from 'moment';

interface User {
    id: number;
    username: string;
    fotoProfil: string | null;
}

interface Notifikasi {
    id: number;
    content: string;
    isRead: boolean;
    created_at: string;
    forum_id?: number | null;
    forum_title?: string;
    forum_relative_time?: string;
    reply_id?: number | null;
    reply?: string;
    reply_user?: string;
    reply_profile?: string | null;
    reply_relative_time?: string;
    comment_id?: number | null;
    comment?: string;
    user?: string;
    profile?: string | null;
    relative_time?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

const NotifikasiPage = () => {
    const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifikasi`, { withCredentials: true })
            .then((res) => {
                setNotifikasi(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            })
            .catch((err) => console.error("Error fetching notifications:", err));
    }, []);

    const handleReadNotification = async (id: number) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifikasi/${id}`, {}, { withCredentials: true });
            setNotifikasi((prev) =>
                prev.map((notif) => notif.id === id ? { ...notif, isRead: true } : notif)
            );
            setUnreadCount((prev) => prev > 0 ? prev - 1 : 0);
        } catch (error) {
            console.error("Error updating notification:", error);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="mx-auto p-4 ml-5 flex-1">
                <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
                <p className="text-gray-500">Belum Dibaca: {unreadCount}</p>
                {notifikasi.length === 0 ? (
                    <p className="text-gray-500">Tidak ada notifikasi</p>
                ) : (
                    <div className="space-y-2 w-[800px]">
                        {notifikasi.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-lg shadow-md cursor-pointer transition ${notif.isRead ? "bg-white" : "bg-blue-100"}`}
                                onClick={() => handleReadNotification(notif.id)}
                            >
                                <div className="flex items-center">
                                    <img
                                        src={notif.reply_profile || notif.profile ? `${apiUrl}${notif.reply_profile || notif.profile}` : "/default-avatar.png"}
                                        alt="Foto Profil"
                                        className="w-[40px] h-[40px] rounded-full object-cover mr-3"
                                    />
                                    <div>
                                        <p className="font-semibold">{notif.content}</p>
                                        <p className="text-sm text-gray-500">{moment(notif.created_at).fromNow()}</p>
                                    </div>
                                </div>
                                {notif.forum_title && (
                                    <p className="text-sm text-gray-500">Forum: {notif.forum_title} ({moment(notif.forum_relative_time).fromNow()})</p>
                                )}
                                {notif.comment && (
                                    <p className="text-sm text-gray-500">Komentar: {notif.comment} ({moment(notif.relative_time).fromNow()})</p>
                                )}
                                {notif.reply && (
                                    <p className="text-sm text-gray-500">Balasan: {notif.reply} ({moment(notif.reply_relative_time).fromNow()})</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotifikasiPage;
