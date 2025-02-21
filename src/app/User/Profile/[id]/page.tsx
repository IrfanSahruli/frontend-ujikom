'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Sidebar from '@/app/components/Sidebar';

interface Post {
    id: number;
    foto: string | null;
    waktu: string | null;
    konten: string | null;
}

interface User {
    id: number;
    username: string;
    fotoProfil: string | null;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

export default function UserProfile() {
    const params = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [postingan, setPostingan] = useState<Post[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile/${params.id}`, { withCredentials: true });
                setUser(response.data.user);
                setPostingan(response.data.user.postingan || []);
            } catch (error) {
                console.error('Gagal mengambil data user', error);
            }
        };

        fetchUserProfile();
    }, [params.id]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="w-3/4 p-5 flex flex-col items-center">
                {/* Profil Header */}
                <div className="w-full max-w-3xl flex flex-col items-center text-center border-b pb-5">
                    {user ? (
                        <>
                            <img
                                src={user.fotoProfil ? `${apiUrl}${user.fotoProfil}` : "/default-avatar.png"}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border"
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
                            <div key={post.id} className="bg-white p-6 rounded-lg border">
                                <div className="flex items-center">
                                    <img
                                        src={user?.fotoProfil ? `${apiUrl}${user.fotoProfil}` : "/default-avatar.png"}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full mr-2 object-cover"
                                    />
                                    <div>
                                        <span className="text-[18px] font-semibold">{user?.username}</span>
                                        <p className='text-gray-500 text-[10px] mt-0'>{post.waktu}</p>
                                    </div>
                                </div>
                                <p className="mt-2">{post.konten}</p>
                                {post.foto && (
                                    <img
                                        src={`${apiUrl}${post.foto}`}
                                        alt={`Foto ${post.id}`}
                                        className="w-[600px] h-[500px] rounded-md mt-4 object-cover"
                                    />
                                )}
                                <div className="flex items-center space-x-4 mt-4">
                                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
                                        👍 <span className="text-sm">Like</span>
                                    </button>
                                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
                                        onClick={() => router.push(`/User/PostinganDetail/${post.id}`)}>
                                        💬 <span className="text-sm">Komentar</span>
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
