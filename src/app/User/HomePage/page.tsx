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
    const [isOpen, setIsOpen] = useState(false); // Tambahkan state modal
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
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
                        <p className="text-center text-gray-500">Tidak ada postingan.</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-white p-6 rounded-lg border">
                                <div className="flex">
                                    {/* Tambahkan Link ke halaman profil user */}
                                    <Link href={`/User/Profile/${post.user.id}`} className="flex items-center">
                                        <img
                                            src={post.user?.fotoProfil ? `${apiUrl}${post.user.fotoProfil}` : "/default-avatar.png"}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full mr-2 object-cover cursor-pointer"
                                        />
                                        <div>
                                            <span className="text-[18px] hover:underline cursor-pointer">
                                                {post.user?.username}
                                            </span>
                                            <p className='text-gray-500 text-[10px] mt-0'>{post.waktu}</p>
                                        </div>
                                    </Link>
                                </div>
                                <p className="mt-2">{post.konten}</p>
                                {post.foto && (
                                    <img src={`${apiUrl}${post.foto}`} alt={`Foto ${post.id}`} className="w-[600px] h-[500px] rounded-md mt-4" />
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
