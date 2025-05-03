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
    jumlahShare: number;
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
    createdAt: string;
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

    const handleReply = async (komentarId: number) => {
        if (!newReply[komentarId]?.trim()) return;

        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/balaskomentar`,
                {
                    komentarId,
                    balasanKomentar: newReply[komentarId],
                },
                { withCredentials: true }
            );

            setReplies((prev) => ({
                ...prev,
                [komentarId]: [...(prev[komentarId] || []), res.data.balasan],
            }));

            setNewReply({ ...newReply, [komentarId]: "" });
        } catch (err) {
            console.error("Gagal mengirim balasan", err);
        }
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

    const handleShare = async (postId: number) => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/User/PostinganDetail/${postId}`);
            alert("Link berhasil disalin!");

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/postingan/share/${postId}`, {}, { withCredentials: true });

            setPost((prev) =>
                prev
                    ? { ...prev, jumlahShare: (prev.jumlahShare || 0) + 1 }
                    : prev
            );

        } catch (err) {
            console.error("Gagal share:", err);
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
                    <button
                        className="flex items-center space-x-1 transition-transform duration-200 transform hover:scale-110 text-gray-600 hover:text-blue-500"
                        onClick={() => handleShare(post.id)}
                    >
                        🔗 Share ({post?.jumlahShare || 0})
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
                                                {replies[comment.id]?.map((reply) => (
                                                    <div key={reply.id} className="flex items-start mt-2">
                                                        <img
                                                            src={reply.user?.fotoProfil ? `${apiUrl}${reply.user.fotoProfil}` : "/default-avatar.png"}
                                                            alt="Avatar"
                                                            className="w-7 h-7 rounded-full object-cover"
                                                        />
                                                        <div className="ml-2">
                                                            <span className="font-semibold text-sm">{reply.user.username}</span>
                                                            <p className="text-xs text-gray-400">{dayjs(reply.createdAt).fromNow()}</p>
                                                            <p className="text-sm">
                                                                <span>{reply.balasanKomentar}</span>
                                                            </p>

                                                            {/* Tombol balas reply */}
                                                            <button
                                                                onClick={() => {
                                                                    setReplyVisibility((prev) => ({
                                                                        ...prev,
                                                                        [comment.id]: true,
                                                                    }));
                                                                    setNewReply({
                                                                        ...newReply,
                                                                        [comment.id]: `@${reply.user.username} `,
                                                                    });
                                                                }}
                                                                className="text-blue-500 text-xs mt-1"
                                                            >
                                                                Balas
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Form Input Balas */}
                                                <div className="mt-2 flex">
                                                    <input
                                                        type="text"
                                                        className="border p-1 w-full text-xs mr-2"
                                                        placeholder="Tulis balasan..."
                                                        value={newReply[comment.id] || ""}
                                                        onChange={(e) =>
                                                            setNewReply({ ...newReply, [comment.id]: e.target.value })
                                                        }
                                                    />
                                                    <button
                                                        onClick={() => handleReply(comment.id)}
                                                        className="bg-blue-500 text-white text-xs px-2 py-1 mt-1 rounded"
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
