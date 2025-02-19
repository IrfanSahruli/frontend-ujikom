'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Link from 'next/link';

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
    komentarUsername: string;
    createdAt: string;
    user: {
        id: number;
        username: string;
        fotoProfil: string | null;
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3500';

function HomePage() {
    const [user, setUser] = useState<{ id: number; username: string; fotoProfil: string | null } | null>(null);
    const [konten, setKonten] = useState<string>('');
    const [foto, setFoto] = useState<File | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string>('');
    const [kategoriFilter, setKategoriFilter] = useState<string>('');
    const [kategori, setKategori] = useState<string>('');
    const [activePost, setActivePost] = useState<number | null>(null);
    const [comments, setComments] = useState<Record<number, any[]>>({});
    const [newComment, setNewComment] = useState<Record<number, string>>({});
    const [activeComment, setActiveComment] = useState<Record<number, boolean>>({});
    const [replies, setReplies] = useState<Record<number, Reply[]>>({});
    const [newReply, setNewReply] = useState<Record<number, string>>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false); // Tambahkan state modal
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/getMe`, {
                withCredentials: true,
            });
            setUser(response.data); // Pastikan response sesuai
        } catch (error) {
            console.error('Gagal mengambil data user', error);
        }
    };

    const fetchPosts = async (kategoriFilter?: string) => {
        try {
            const url = kategoriFilter
                ? `${process.env.NEXT_PUBLIC_API_URL}/postingan/kategori/${kategoriFilter}`
                : `${process.env.NEXT_PUBLIC_API_URL}/postingan`;

            const response = await axios.get(url, { withCredentials: true });
            setPosts(response.data.postingan);
        } catch (err) {
            setError('Terjadi kesalahan saat mengambil postingan. Silahkan coba lagi.');
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/balaskomentar/${komentarId}`, {
                withCredentials: true,
            });

            setReplies((prev) => ({
                ...prev,
                [komentarId]: response.data, // Simpan hasil fetch di state
            }));
        } catch (error) {
            console.error('Gagal memuat balasan', error);
        }
    };

    const addReply = async (komentarId: number, username: string) => {
        const mention = `@${username} `;
        const existingText = newReply[komentarId] || '';

        // Jika belum ada mention dalam teks, tambahkan
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

            setNewReply((prev) => ({ ...prev, [komentarId]: '' })); // Reset input setelah balas
        } catch (error) {
            console.error('Gagal menambah balasan komentar', error);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchPosts(kategoriFilter);
    }, [kategoriFilter]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!konten.trim() || !kategori) {
            setError("Konten dan kategori tidak boleh kosong.");
            return;
        }

        const formData = new FormData();
        formData.append("konten", konten);
        formData.append("kategori", kategori);
        if (foto) {
            formData.append("foto", foto);
        }

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/postingan`,
                formData,
                { withCredentials: true }
            );

            setPosts([response.data.postingan, ...posts]); // Tambahkan postingan baru ke state
            setIsOpen(false);
            setKonten("");
            setFoto(null);
            setKategori("");
        } catch (err) {
            setError("Gagal mengirim postingan. Pastikan server berjalan.");
        }
    };

    const handleReplyClick = async (komentarId: number, username: string) => {
        setActiveComment((prev) => ({ ...prev, [komentarId]: !prev[komentarId] }));

        // Jika belum ada data balasan, baru fetch
        if (!replies[komentarId]) {
            await fetchReplies(komentarId);
        }

        // Tambahkan mention secara otomatis ke input balasan
        setNewReply((prev) => {
            const mention = `@${username} `;
            return { ...prev, [komentarId]: prev[komentarId]?.startsWith(mention) ? prev[komentarId] : mention };
        });
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-grow flex flex-col items-start mt-6 ml-5">
                <h1 className="text-3xl font-bold text-center text-white mb-6 ml-96">
                    <p className="text-black">Kick<span className="text-yellow-600">Talk</span></p>
                </h1>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <div className="w-[800px] bg-white py-4 rounded-lg mb-5">
                    <div
                        onClick={() => setIsOpen(true)}
                        className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                        {user ? (
                            <img
                                src={user.fotoProfil ? `${apiUrl}${user.fotoProfil}` : "/default-avatar.png"}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 animate-pulse"></div>
                        )}
                        <span className="text-gray-500">Apa yang Anda pikirkan?</span>
                    </div>

                    {isOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white w-[500px] p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4">Buat Postingan Baru</h2>
                                <form onSubmit={handleSubmit}>
                                    <textarea
                                        name="konten"
                                        value={konten}
                                        onChange={(e) => setKonten(e.target.value)}
                                        placeholder="Tulis sesuatu..."
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                                    ></textarea>

                                    {/* Dropdown kategori */}
                                    <select
                                        name="kategori"
                                        value={kategori}
                                        onChange={(e) => setKategori(e.target.value)}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                                    >
                                        <option value="" disabled>Pilih Kategori</option>
                                        <option value="sepak bola">Sepak Bola</option>
                                        <option value="futsal">Futsal</option>
                                    </select>

                                    <input
                                        type="file"
                                        name="foto"
                                        accept="image/*"
                                        onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg mb-4 cursor-pointer"
                                    />

                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                        >
                                            Posting
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-[800px] space-y-4">
                    {posts.length === 0 ? (
                        <p className="text-center text-gray-500">Tidak ada postingan untuk ditampilkan.</p>
                    ) : (
                        posts.map((post) => (
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
                                                            {/* Tombol Balas & Tutup */}
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    className="text-blue-500 text-sm font-medium"
                                                                    onClick={() => handleReplyClick(comment.id, comment.user.username)}
                                                                >
                                                                    {activeComment[comment.id] ? "Balas" : "Balas"}
                                                                </button>

                                                                {activeComment[comment.id] && (
                                                                    <button
                                                                        className="text-red-500 text-sm font-medium"
                                                                        onClick={() => setActiveComment((prev) => ({ ...prev, [comment.id]: false }))}
                                                                    >
                                                                        Tutup
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Balasan Komentar */}
                                                            {activeComment[comment.id] && (
                                                                <div className="mt-2 border-l-2 pl-3">
                                                                    {replies[comment.id]?.map((reply) => {
                                                                        // Regex untuk mendeteksi username di awal teks (misalnya "@adul teks balasan...")
                                                                        const mentionMatch = reply.balasanKomentar.match(/^@(\S+)\s(.*)/);

                                                                        // Pisahkan username dari teks balasan
                                                                        const mentionUsername = mentionMatch ? mentionMatch[1] : null;
                                                                        const balasanTeks = mentionMatch ? mentionMatch[2] : reply.balasanKomentar;

                                                                        return (
                                                                            <div key={reply.id} className="flex space-x-2 mt-1">
                                                                                <img
                                                                                    src={reply.user?.fotoProfil ? `${apiUrl}${reply.user.fotoProfil}` : "/default-avatar.png"}
                                                                                    alt="Avatar"
                                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                                />
                                                                                <div className="rounded-lg text-sm block mt-[2px]">
                                                                                    <span className="font-semibold">{reply.user.username}</span>
                                                                                    <div className="flex">
                                                                                        {/* Jika ada username mention, tampilkan dengan style khusus */}
                                                                                        {mentionUsername && (
                                                                                            <span className="text-blue-500 font-semibold mr-1">@{mentionUsername}</span>
                                                                                        )}
                                                                                        <p>{balasanTeks}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}

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

            {/* Filter Kategori */}
            <div className="flex flex-col border rounded-lg h-[110px] items-center mr-2 top-4 sticky">
                {/* Container untuk tombol Semua dan Sepak Bola */}
                <div className="flex m-2">
                    <button
                        className="bg-white text-black py-2 px-4 border rounded hover:bg-gray-50 min-w-[50px]"
                        onClick={() => setKategoriFilter('')}
                    >
                        Semua
                    </button>
                    <button
                        className="bg-white text-black py-2 px-4 border rounded hover:bg-gray-50 min-w-[50px] ml-2"
                        onClick={() => setKategoriFilter('sepak bola')}
                    >
                        Sepak Bola
                    </button>
                </div>

                {/* Tombol Futsal */}
                <button
                    className="bg-white text-black py-2 px-4 border rounded hover:bg-gray-50 min-w-[50px]"
                    onClick={() => setKategoriFilter('futsal')}
                >
                    Futsal
                </button>
            </div>

        </div>
    );
}

export default HomePage;
