"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import axios from "axios";
import Sidebar from "@/app/components/Sidebar";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

interface Post {
    id: number;
    caption: string;
    foto: string | null;
    waktu: string;
    like: number;
    jumlahKomentar: number;
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
    childBalasan?: Reply[];
}

dayjs.extend(relativeTime);
dayjs.locale('id');

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

function PostinganDetail() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
    const [replies, setReplies] = useState<{ [key: number]: Reply[] }>({});
    const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
    const [newReply, setNewReply] = useState<{ [key: number]: string }>({});
    const [replyVisibility, setReplyVisibility] = useState<{ [key: number]: boolean }>({});
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post?.like || 0);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, {
                withCredentials: true,
            });

            if (res.data.role !== 'user') {
                router.push('/Login'); // bukan admin
            } else {
                setLoading(false);
                if (params.postId) {
                    fetchPost();
                    fetchLikeStatus();
                    fetchComments();
                }
            }
        } catch (error) {
            router.push('/Login'); // token invalid / belum login
        }
    };

    const fetchPost = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/postingan/${params.postId}`,
                { withCredentials: true }
            );
            const postData = response.data.postingan;
            setPost(postData);
            setLikeCount(postData.like);
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

    const fetchReplies = async (komentarId: number) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/balaskomentar/${komentarId}`,
                { withCredentials: true }
            );

            const repliesData = response.data.map((reply: Reply) => ({
                ...reply,
                childBalasan: [], // Tambahkan array kosong untuk balasan dari balasan
            }));

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

    const addSubReply = async (parentReplyId: number, komentarId: number, username: string) => {
        const mention = `@${username} `;
        const existingText = newReply[parentReplyId] || "";
        const replyText = existingText.startsWith(mention) ? existingText.trim() : mention + existingText.trim();

        if (!replyText) return;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/balaskomentar`,
                { komentarId, parentReplyId, balasanKomentar: replyText },
                { withCredentials: true }
            );

            const newSubReply = response.data.balasan;

            setReplies((prev) => ({
                ...prev,
                [komentarId]: prev[komentarId].map((reply) =>
                    reply.id === parentReplyId
                        ? { ...reply, childBalasan: [...(reply.childBalasan || []), newSubReply] }
                        : reply
                ),
            }));

            setNewReply((prev) => ({ ...prev, [parentReplyId]: "" }));
        } catch (error) {
            console.error("Gagal menambah balasan komentar", error);
        }
    };

    const toggleReplyVisibility = (replyId: number, username: string) => {
        setReplyVisibility((prev) => ({
            ...prev,
            [replyId]: !prev[replyId], // Toggle antara true/false
        }));

        setNewReply((prev) => ({
            ...prev,
            [replyId]: prev[replyId] || `@${username} `, // Isi otomatis dengan mention jika kosong
        }));
    };

    const handleLikeToggle = async () => {
        if (!post) return;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/like/${params.postId}`,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                setLiked((prev) => !prev); // Toggle status liked
                setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const fetchLikeStatus = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/like/status/${params.postId}`,
                { withCredentials: true }
            );

            if (response.status === 200) {
                setLiked(response.data.liked);
                setLikeCount(response.data.likeCount);
            }
        } catch (error) {
            console.error("Error fetching like status:", error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [params.postId]);

    if (!post) return <div className='flex justify-center items-center h-screen'>
        <p className='text-xl font-semibold'>Loading...</p>
    </div>;

    return (
        <div className="flex">
            <Sidebar />
            <div className="relative p-6 ml-16 mt-10 mb-10 bg-white rounded-lg border w-[800px]">
                <button
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-300 transition"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center mb-4 mt-10">
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
                        <p className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full w-max">
                            {dayjs(post?.waktu).fromNow()}
                        </p>
                    </div>
                </div>
                <p className="mb-4">{post.caption}</p>
                {post.foto && <img src={`${apiUrl}${post.foto}`} alt="Foto Postingan" className="rounded-md" />}
                <div className="flex items-center space-x-4 mt-4">
                    <button
                        onClick={handleLikeToggle}
                        className={`flex items-center space-x-1 ${liked ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
                    >
                        👍 <span className="text-sm">{likeCount}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
                        💬 <span className="text-sm">Komentar ({post?.jumlahKomentar || 0})</span>
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
                                                    <div key={reply.id} className="ml-6 mt-2 border-l-2 pl-3">
                                                        <div className="flex items-start mt-2">
                                                            <img
                                                                src={reply.user?.fotoProfil ? `${apiUrl}${reply.user.fotoProfil}` : "/default-avatar.png"}
                                                                alt="Avatar"
                                                                className="w-6 h-6 rounded-full object-cover"
                                                            />
                                                            <div className="ml-2">
                                                                <span className="font-semibold text-xs">{reply.user.username}</span>
                                                                <p className="text-sm">{reply.balasanKomentar}</p>
                                                                <button onClick={() => toggleReplyVisibility(reply.id, reply.user.username)} className="text-blue-500 text-xs">
                                                                    Balas
                                                                </button>

                                                                {replyVisibility[reply.id] && (
                                                                    <div className="ml-6 mt-2 border-l-2 pl-3">
                                                                        {reply.childBalasan?.map((subReply) => (
                                                                            <div key={subReply.id} className="flex items-start mt-2">
                                                                                <img
                                                                                    src={subReply.user?.fotoProfil ? `${apiUrl}${subReply.user.fotoProfil}` : "/default-avatar.png"}
                                                                                    alt="Avatar"
                                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                                />
                                                                                <div className="ml-2">
                                                                                    <span className="font-semibold text-xs">{subReply.user.username}</span>
                                                                                    <p className="text-sm">{subReply.balasanKomentar}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}

                                                                        {/* Input untuk Balasan Balasan */}
                                                                        <div className="flex items-center mt-2 gap-2">
                                                                            <textarea
                                                                                value={newReply[reply.id] || ""}
                                                                                onChange={(e) => setNewReply((prev) => ({ ...prev, [reply.id]: e.target.value }))}
                                                                                className="border rounded p-1 flex-1 text-sm resize-none overflow-y-auto"
                                                                                placeholder="Tulis balasan..."
                                                                                rows={1}
                                                                            />
                                                                            <button
                                                                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                                                                                onClick={() => addSubReply(reply.id, comment.id, reply.user.username)}
                                                                            >
                                                                                Kirim
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Input untuk Balasan */}
                                                <div className="flex items-center mt-2 gap-2">
                                                    <textarea
                                                        value={newReply[comment.id] || ""}
                                                        onChange={(e) => setNewReply({ ...newReply, [comment.id]: e.target.value })}
                                                        className="border rounded p-1 flex-1 text-sm resize-none overflow-y-auto"
                                                        placeholder="Tulis balasan..."
                                                        rows={1}
                                                    />
                                                    <button
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
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
                    <div className="flex items-center gap-2 mt-2">
                        <textarea
                            placeholder="Tulis komentar..."
                            value={newComment[post.id] || ""}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                            className="border rounded p-1 flex-1 w-[675px] resize-none overflow-y-auto"
                            rows={1}
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
        </div>
    );
}

export default PostinganDetail;
