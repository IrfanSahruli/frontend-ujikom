'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Sidebar from '@/app/components/Sidebar';

interface Post {
    id: number;
    foto: string | null;
    waktu: string | null;
    caption: string | null;
    like: number;
    isLiked: boolean;
    jumlahKomentar: number;
}

interface User {
    id: number;
    username: string;
    fotoProfil: string | null;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

export default function UserProfile() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [postingan, setPostingan] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<number[]>([]);
    const [likeCount, setLikeCount] = useState(postingan.length > 0 ? postingan[0].like : 0);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [params.id]);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, {
                withCredentials: true,
            });

            if (res.data.role !== 'user') {
                router.push('/Login'); // bukan admin
            } else {
                setLoading(false);
                fetchUserProfile();
            }
        } catch (error) {
            router.push('/Login'); // token invalid / belum login
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/profile/${params.id}`,
                { withCredentials: true }
            );
            setUser(response.data.user);
            setPostingan(response.data.user.postingan || []);

            // Ambil daftar post yang sudah di-like oleh user dari API `/like`
            const likedPromises = response.data.user.postingan.map(async (post: Post) => {
                const likeStatus = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/like/status/${post.id}`,
                    { withCredentials: true }
                );
                return likeStatus.data.liked ? post.id : null;
            });

            const likedPostIds = (await Promise.all(likedPromises)).filter((id) => id !== null);
            setLikedPosts(likedPostIds);
        } catch (error) {
            console.error('Gagal mengambil data user', error);
        }
    };

    const handleLikeToggle = async (postId: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/like/${postId}`,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                setPostingan((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, like: response.data.like } : post
                    )
                );

                setLikedPosts((prev) =>
                    prev.includes(postId)
                        ? prev.filter((id) => id !== postId) // Remove dari likedPosts jika sudah like
                        : [...prev, postId] // Tambahkan ke likedPosts jika belum like
                );
            }
        } catch (error) {
            console.error("Error updating like status:", error);
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

            <div className="w-3/4 p-5 flex flex-col items-center">
                {/* Profil Header */}
                <div className="relative mt-7 w-[800px] flex flex-col items-center text-center bg-white p-5 rounded-2xl shadow-md">
                    {/* Tombol Panah Kembali */}
                    <button
                        className="absolute top-1 left-1 p-2 rounded-full hover:bg-gray-200 transition"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    {user ? (
                        <>
                            <img
                                src={user.fotoProfil ? `${apiUrl}${user.fotoProfil}` : "/default-avatar.png"}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md transition duration-300 hover:scale-105 hover:border-blue-300"
                            />
                            <p className="mt-2 text-2xl font-bold text-gray-800">{user.username}</p>
                            <div className="flex space-x-6 mt-4">
                                <p><span className="font-bold">{postingan.length}</span> Postingan</p>
                            </div>
                        </>
                    ) : (
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                            <div className="w-20 h-4 mt-2 bg-gray-300 rounded"></div>
                        </div>
                    )}
                </div>

                {/* Postingan List View */}
                <div className="w-[800px] space-y-4 mt-5">
                    <p className="text-center font-bold">Postingan:</p>
                    {postingan.length === 0 ? (
                        <p className="text-center text-gray-500">Belum ada postingan.</p>
                    ) : (
                        postingan.map((post) => (
                            <div key={post.id} className="bg-white p-6 rounded-lg shadow-lg border hover:shadow-2xl transition duration-300">
                                <div className="flex items-center">
                                    <img
                                        src={user?.fotoProfil ? `${apiUrl}${user.fotoProfil}` : "/default-avatar.png"}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full mr-2 object-cover"
                                    />
                                    <div>
                                        <span className="text-[18px] font-semibold">{user?.username}</span>
                                        <p className='text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full w-max'>
                                            {post.waktu}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-2">{post.caption}</p>
                                {post.foto && (
                                    <img
                                        src={`${apiUrl}${post.foto}`}
                                        alt={`Foto ${post.id}`}
                                        className="w-[600px] h-[500px] rounded-md mt-4 object-cover"
                                    />
                                )}
                                <div className="flex items-center space-x-4 mt-4">
                                    <button
                                        onClick={() => handleLikeToggle(post.id)}
                                        className={`flex items-center space-x-1 transition-transform duration-200 transform hover:scale-110 
                                        ${likedPosts.includes(post.id) ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
                                    >
                                        👍 <span className="text-sm">{post.like}</span>
                                    </button>
                                    <button className="flex items-center space-x-1 transition-transform duration-200 transform hover:scale-110 text-gray-600 hover:text-blue-500"
                                        onClick={() => router.push(`/User/PostinganDetail/${post.id}`)}>
                                        💬 <span className="text-sm">Komentar ({post?.jumlahKomentar || 0})</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
