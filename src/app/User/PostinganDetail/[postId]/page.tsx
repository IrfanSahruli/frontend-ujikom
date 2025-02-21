"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Sidebar from "@/app/components/Sidebar";

interface Post {
    id: number;
    konten: string;
    foto: string | null;
    waktu: string;
    user: {
        id: number;
        username: string;
        fotoProfil: string | null;
    };
}

interface Comment {
    postId: number;
    id: number;
    isiKomentar: string;
    waktu: string;
    user: {
        id: number;
        username: string;
        fotoProfil: string | null;
    };
}

interface Reply {
    id: number;
    balasanKomentar: string;
    user: {
        id: number;
        username: string;
        fotoProfil: string | null;
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

function PostinganDetail() {
    const params = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
    const [replies, setReplies] = useState<{ [key: number]: Reply[] }>({});
    const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
    const [newReply, setNewReply] = useState<{ [key: number]: string }>({});
    const [replyVisibility, setReplyVisibility] = useState<{ [key: number]: boolean }>({});
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/postingan/${params.postId}`,
                    { withCredentials: true }
                );
                setPost(response.data.postingan);
            } catch (error) {
                console.error("Gagal mengambil detail postingan", error);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/komentar?postId=${params.postId}`,
                    { withCredentials: true }
                );

                // Ubah array komentar menjadi objek dengan postId sebagai key
                const groupedComments: { [key: number]: Comment[] } = {};
                response.data.komentar.forEach((comment: Comment) => {
                    if (!groupedComments[comment.postId]) {
                        groupedComments[comment.postId] = [];
                    }
                    groupedComments[comment.postId].push(comment);
                });

                setComments(groupedComments);
            } catch (error) {
                console.error("Gagal mengambil komentar", error);
            }
        };

        if (params.postId) {
            fetchPost();
            fetchComments();
        }
    }, [params.postId]);

    const fetchReplies = async (komentarId: number) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/balaskomentar/${komentarId}`,
                { withCredentials: true }
            );
            setReplies((prev) => ({
                ...prev,
                [komentarId]: response.data,
            }));
        } catch (error) {
            console.error("Gagal memuat balasan", error);
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
            setNewComment((prev) => ({ ...prev, [postId]: "" }));
        } catch (error) {
            setError("Gagal menambah komentar.");
        }
    };

    const addReply = async (komentarId: number, username: string) => {
        const mention = `@${username} `;
        const existingText = newReply[komentarId] || "";
        const replyText = existingText.startsWith(mention) ? existingText.trim() : mention + existingText.trim();

        if (!replyText) return;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/balaskomentar`,
                { komentarId, balasanKomentar: replyText },
                { withCredentials: true }
            );

            setReplies((prev) => ({
                ...prev,
                [komentarId]: [...(prev[komentarId] || []), response.data.balasan],
            }));

            setNewReply((prev) => ({ ...prev, [komentarId]: "" }));
        } catch (error) {
            console.error("Gagal menambah balasan komentar", error);
        }
    };

    if (!post) return <p>Loading...</p>;

    return (
        <div className="flex">
            <Sidebar />
            <div className="p-6 ml-10 mt-10 mb-10 bg-white rounded-lg border w-[800px]">
                <button onClick={() => router.back()} className="text-blue-500 mb-4">
                    ← Kembali
                </button>
                <div className="flex items-center mb-4">
                    <img
                        src={
                            post.user.fotoProfil
                                ? `${apiUrl}${post.user.fotoProfil}`
                                : "/default-avatar.png"
                        }
                        alt="Avatar"
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                        <p className="font-semibold">{post.user.username}</p>
                        <p className="text-gray-500 text-sm">{post.waktu}</p>
                    </div>
                </div>
                <p className="mb-4">{post.konten}</p>
                {post.foto && <img src={`${apiUrl}${post.foto}`} alt="Foto Postingan" className="rounded-md" />}
                <div className="flex items-center space-x-4 mt-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
                        👍 <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
                        💬 <span className="text-sm">Komentar</span>
                    </button>
                </div>
                <hr className="mt-5" />

                {/* Komentar Langsung Ditampilkan */}
                <div className="mt-4">
                    {comments[post.id]?.length > 0 ? (
                        comments[post.id].map((comment) => (
                            <div key={comment.id} className="mt-4">
                                <div className="flex items-start">
                                    <img
                                        src={comment.user?.fotoProfil ? `${apiUrl}${comment.user.fotoProfil}` : "/default-avatar.png"}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="ml-2">
                                        <span className="font-semibold text-sm">{comment.user.username}</span>
                                        <p className="text-gray-500 text-xs">{comment.waktu}</p>
                                        <p className="text-sm">{comment.isiKomentar}</p>

                                        {/* Tombol Balas & Tutup */}
                                        <button
                                            onClick={() => {
                                                setReplyVisibility((prev) => ({
                                                    ...prev,
                                                    [comment.id]: !prev[comment.id], // Toggle visibility
                                                }));
                                                if (!replyVisibility[comment.id]) {
                                                    fetchReplies(comment.id); // Ambil balasan jika belum ditampilkan
                                                    setNewReply({ ...newReply, [comment.id]: `@${comment.user.username} ` });
                                                }
                                            }}
                                            className="text-blue-500 text-xs mt-1"
                                        >
                                            {replyVisibility[comment.id] ? "Tutup" : "Balas"}
                                        </button>

                                        {/* Balasan Komentar & Form Balasan (Tampil jika tombol "Balas" diklik) */}
                                        {replyVisibility[comment.id] && (
                                            <div className="ml-6 mt-2 border-l-2 pl-3">
                                                {/* Menampilkan Balasan */}
                                                {replies[comment.id]?.map((reply) => (
                                                    <div key={reply.id} className="flex items-start mt-2">
                                                        <img
                                                            src={reply.user?.fotoProfil ? `${apiUrl}${reply.user.fotoProfil}` : "/default-avatar.png"}
                                                            alt="Avatar"
                                                            className="w-6 h-6 rounded-full object-cover"
                                                        />
                                                        <div className="ml-2">
                                                            <span className="font-semibold text-xs">{reply.user.username}</span>
                                                            <p className="text-sm">{reply.balasanKomentar}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Input untuk Balasan */}
                                                <div className="flex items-center mt-2">
                                                    <input
                                                        type="text"
                                                        value={newReply[comment.id] || ""}
                                                        onChange={(e) => setNewReply({ ...newReply, [comment.id]: e.target.value })}
                                                        className="border rounded p-1 flex-1 text-sm"
                                                        placeholder="Tulis balasan..."
                                                    />
                                                    <button
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs ml-2"
                                                        onClick={() => addReply(comment.id, comment.user.username)}
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
                        <input
                            type="text"
                            placeholder="Tulis komentar..."
                            value={newComment[post.id] || ""}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                            className="border rounded p-1 flex-1"
                        />
                        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => addComment(post.id)}>
                            Kirim
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostinganDetail;
