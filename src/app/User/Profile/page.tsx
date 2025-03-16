"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/app/components/Sidebar";

interface Post {
    id: number;
    userId: number;
    foto: string | null;
    waktu: string | null;
    konten: string | null;
    like: number;
    isLiked: boolean,
    jumlahKomentar: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

const Profile = () => {
    const [user, setUser] = useState<{ id: number; username: string; fotoProfil: string | null } | null>(null);
    const [postingan, setPostingan] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<number[]>([]);
    const [likeCount, setLikeCount] = useState(postingan.length > 0 ? postingan[0].like : 0);
    const router = useRouter();

    useEffect(() => {
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

                const likedPostIds = response.data.postingan
                    .filter((post: Post) => post.isLiked)
                    .map((post: Post) => post.id);

                setLikedPosts(likedPostIds);
            } catch (error) {
                console.error("Gagal mengambil postingan saya", error);
            }
        };

        fetchUser();
        fetchMyPosts();
    }, []);

    const handelLike = async (postId: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/postingan/like/${postId}`,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                setPostingan((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, like: post.like + 1 } : post
                    )
                );

                // Tambahkan postId ke daftar likedPosts
                setLikedPosts((prev) => [...prev, postId]);
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handelUnlike = async (postId: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/postingan/unlike/${postId}`,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                setPostingan((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, like: post.like - 1 } : post
                    )
                );

                // Hapus postId dari daftar likedPosts
                setLikedPosts((prev) => prev.filter((id) => id !== postId));
            }
        } catch (error) {
            console.error("Error unliking post:", error);
        }
    };

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
                    <p className="text-center font-bold">Postingan Saya:</p>
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
                                    <button
                                        onClick={() => likedPosts.includes(post.id) ? handelUnlike(post.id) : handelLike(post.id)}
                                        className={`flex items-center space-x-1 ${likedPosts.includes(post.id) ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
                                    >
                                        👍 <span className="text-sm">{post.like}</span>
                                    </button>
                                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
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
};

export default Profile;
