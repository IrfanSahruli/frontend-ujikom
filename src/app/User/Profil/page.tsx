"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/app/components/Sidebar";

interface Post {
    id: number;
    userId: number;
    konten: string | null;
    foto: string | null;
    like: number;
    kategori: string | null;
    waktu: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        username: string;
        fotoProfil: string | null;
    };
}

interface Reply {
    id: number;
    userId: number;
    komentarId: number;
    balasanKomentar: string;
    createdAt: string;
    user: {
        id: number;
        username: string;
        fotoProfil: string | null;
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

const Profil = () => {
    const [user, setUser] = useState<{ id: number; username: string; fotoProfil: string | null } | null>(null);
    const [postingan, setPostingan] = useState<Post[]>([]);
    const [activePost, setActivePost] = useState<number | null>(null);
    const [comments, setComments] = useState<Record<number, any[]>>({});
    const [newComment, setNewComment] = useState<Record<number, string>>({});
    const [activeComment, setActiveComment] = useState<Record<number, boolean>>({});
    const [replies, setReplies] = useState<Record<number, Reply[]>>({});
    const [newReply, setNewReply] = useState<Record<number, string>>({});
    const [error, setError] = useState<string>('');

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, {
                withCredentials: true,
            });
            setUser(response.data);
        } catch (error) {
            console.error("Gagal mengambil data user", error);
        }
    };

    const fetchMyPosts = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/myPostingan`, {
                withCredentials: true,
            });
            setPostingan(response.data.postingan);
        } catch (error) {
            console.error("Gagal mengambil postingan saya", error);
        }
    };

    const fetchComments = async (postId: number) => {
        if (activePost === postId) {
            // Jika postingan sudah aktif, tutup komentar
            setActivePost(null);
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/komentar?postId=${postId}`, {
                withCredentials: true,
            });
            setComments((prev) => ({ ...prev, [postId]: response.data.komentar }));
            setActivePost(postId);
        } catch (error) {
            setError('Gagal memuat komentar.');
        }
    };

    const addComment = async (postId: number) => {
        if (!newComment[postId]?.trim()) return;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/komentar`,
                { postId, isiKomentar: newComment[postId] },
                { withCredentials: true }
            );

            const newKomentar = response.data.komentar;

            setComments((prev) => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newKomentar],
            }));
            setNewComment((prev) => ({ ...prev, [postId]: '' }));
        } catch (error) {
            setError('Gagal menambah komentar.');
        }
    };

    const fetchReplies = async (komentarId: number) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/balaskomentar/${komentarId}`, { withCredentials: true });
            setReplies((prev) => ({ ...prev, [komentarId]: response.data }));
            setActiveComment((prev) => ({ ...prev, [komentarId]: !prev[komentarId] }));
        } catch (error) {
            console.error('Gagal memuat balasan', error);
        }
    };

    const addReply = async (komentarId: number) => {
        if (!newReply[komentarId]?.trim()) return;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/balaskomentar`,
                { komentarId, balasanKomentar: newReply[komentarId] },
                { withCredentials: true }
            );

            setReplies((prev) => ({
                ...prev,
                [komentarId]: [...(prev[komentarId] || []), response.data.balasan],
            }));
            setNewReply((prev) => ({ ...prev, [komentarId]: '' }));
        } catch (error) {
            console.error('Gagal menambah balasan komentar', error);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchMyPosts();
    }, []);

    return (
        <div className="flex min-h-screen">
            {/* Sidebar (Kiri) */}
            <Sidebar />

            {/* Postingan (Di Tengah) */}
            <div className="flex-grow p-5 flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-3">Postingan Saya:</h2>
                <div className="w-[800px] space-y-4">
                    {postingan.length === 0 ? (
                        <p className="text-center text-gray-500">Tidak ada postingan untuk ditampilkan.</p>
                    ) : (
                        postingan.map((post) => (
                            <div key={post.id} className="bg-white p-6 rounded-lg border">
                                <div className="flex">
                                    <img
                                        src={post.user?.fotoProfil ? `${apiUrl}${post.user.fotoProfil}` : "/default-avatar.png"}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full mr-2 object-cover"
                                    />
                                    <div className=''>
                                        <span className="text-[18px]">{post.user?.username}</span>
                                        <p className='text-gray-500 text-[10px] mt-0'>{post.waktu}</p>
                                    </div>
                                </div>
                                <p className="mt-2">{post.konten}</p>

                                {post.foto && (
                                    <div className="mt-4 flex items-center">
                                        <img
                                            src={`${apiUrl}${post.foto}`}
                                            alt={`Foto Postingan ${post.id}`}
                                            className="w-[600px] h-[500px] rounded-md"
                                        />
                                    </div>
                                )}

                                <button
                                    className="text-blue-500 mt-4"
                                    onClick={() => fetchComments(post.id)}
                                >
                                    {activePost === post.id ? 'Tutup Komentar' : 'Lihat Komentar'}
                                </button>

                                {activePost === post.id && (
                                    <div className="mt-4">
                                        {comments[post.id]?.length > 0 ? (
                                            comments[post.id].map((comment) => (
                                                <div key={comment.id} className="mt-2">
                                                    <div className="">
                                                        {/* Avatar User */}
                                                        <div className='flex'>
                                                            <img
                                                                src={comment.user?.fotoProfil ? `${apiUrl}${comment.user.fotoProfil}` : "/default-avatar.png"}
                                                                alt="Avatar"
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            {/* Nama User dan Komentar */}
                                                            <div className="ml-2 rounded-lg">
                                                                <span className="font-semibold text-sm">{comment.user.username}</span>
                                                                <p className='text-gray-500 text-[10px]'>{comment.waktu}</p>
                                                                <p className="text-sm">{comment.isiKomentar}</p>
                                                            </div>
                                                        </div>

                                                        <div className="items-start ml-10">
                                                            {/* Tombol Balas */}
                                                            <button
                                                                className="text-blue-500 text-xs mt-1 relative"
                                                                onClick={() => fetchReplies(comment.id)}
                                                            >
                                                                Balas
                                                            </button>

                                                            {/* Balasan Komentar */}
                                                            {activeComment[comment.id] && (
                                                                <div className="mt-2 border-l-2 pl-3">
                                                                    {replies[comment.id]?.map((reply) => (
                                                                        <div key={reply.id} className="flex space-x-2 mt-1">
                                                                            {/* Avatar User Balasan */}
                                                                            <img
                                                                                src={reply.user?.fotoProfil ? `${apiUrl}${reply.user.fotoProfil}` : "/default-avatar.png"}
                                                                                alt="Avatar"
                                                                                className="w-6 h-6 rounded-full object-cover"
                                                                            />

                                                                            <div className="rounded-lg text-sm block mt-[2px]">
                                                                                <span className="font-semibold">{reply.user.username}</span>
                                                                                <p>
                                                                                    {reply.balasanKomentar}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    {/* Input untuk Balasan */}
                                                                    <div className="flex items-center space-x-2 mt-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Balas komentar..."
                                                                            value={newReply[comment.id] || ''}
                                                                            onChange={(e) => setNewReply((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                                                            className="border rounded-lg p-1 flex-1 text-sm"
                                                                        />
                                                                        <button
                                                                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                                                                            onClick={() => addReply(comment.id)}
                                                                        >
                                                                            Kirim
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm mt-2">Belum ada komentar.</p>
                                        )}

                                        {/* Form Tambah Komentar */}
                                        <div className="mt-4 border-t pt-2">
                                            <div className="mt-2 flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tulis komentar..."
                                                    value={newComment[post.id] || ''}
                                                    onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                                    className="border rounded p-1 flex-1"
                                                />
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                                    onClick={() => addComment(post.id)}
                                                >
                                                    Kirim
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Profil (Di Kanan) */}
            <div className="w-[300px] flex flex-col items-center text-center p-5 shadow-lg border-l sticky top-0 h-screen">
                {user ? (
                    <div>
                        <img
                            src={user.fotoProfil ? `${apiUrl}${user.fotoProfil}` : "/default-avatar.png"}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover mt-32"
                        />
                        <p className="mt-2 text-[20px] font-semibold text-gray-700">{user.username}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="w-20 h-4 mt-2 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profil;
