'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Link from 'next/link';

interface Post {
    id: number;
    userId: number;
    caption: string | null;
    foto: string | null;
    kategori: string | null;
    waktu: string;
    like: number;
    isLiked: boolean;
    jumlahKomentar: number;
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
    const [caption, setCaption] = useState<string>('');
    const [foto, setFoto] = useState<File | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string>('');
    const [kategoriFilter, setKategoriFilter] = useState<string>('');
    const [kategori, setKategori] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false); // Tambahkan state modal
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAlasan, setSelectedAlasan] = useState<Record<number, string>>({});
    const [showModalForPost, setShowModalForPost] = useState<number | null>(null);
    const [likedPosts, setLikedPosts] = useState<number[]>([]);
    const [likeCount, setLikeCount] = useState(posts.length > 0 ? posts[0].like : 0);
    const [sortBy, setSortBy] = useState("terbaru");
    const router = useRouter();

    const alasanLaporan = [
        "Mengandung judi",
        "Mengandung ujaran kebencian",
        "Konten tidak pantas",
        "Spam",
    ];

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
                : `${process.env.NEXT_PUBLIC_API_URL}/allPostingan?sort=${sortBy}`;

            const response = await axios.get(url, { withCredentials: true });
            const posts = response.data.postingan;

            // Ambil status like untuk setiap postingan
            const likedStatuses = await Promise.all(
                posts.map(async (post: Post) => {
                    try {
                        const likeResponse = await axios.get(
                            `${process.env.NEXT_PUBLIC_API_URL}/like/status/${post.id}`,
                            { withCredentials: true }
                        );
                        return { id: post.id, liked: likeResponse.data.liked, likeCount: likeResponse.data.likeCount };
                    } catch (error) {
                        console.error(`Error fetching like status for post ${post.id}:`, error);
                        return { id: post.id, liked: false, likeCount: post.like }; // Default jika gagal fetch
                    }
                })
            );

            // Gabungkan data postingan dengan status like
            const updatedPosts = posts.map((post: Post) => {
                const likeStatus = likedStatuses.find((status) => status.id === post.id);
                return { ...post, isLiked: likeStatus?.liked || false, like: likeStatus?.likeCount || post.like };
            });

            setPosts(updatedPosts);

            // Simpan daftar post yang di-like
            const likedPostIds = likedStatuses.filter((status) => status.liked).map((status) => status.id);
            setLikedPosts(likedPostIds);
        } catch (err) {
            setError("Terjadi kesalahan saat mengambil postingan. Silakan coba lagi.");
        }
    };

    const selectedPost = posts.find((p) => p.id === showModalForPost);

    const laporkanPostingan = async () => {
        if (!selectedPostId) return;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/laporkanPostingan`,
                { postId: selectedPostId, alasan: selectedAlasan[selectedPostId] || "" },
                { withCredentials: true }
            );

            if (response.status === 201) {
                alert("Laporan berhasil dikirim");
                setShowModal(false);
            } else {
                alert("Gagal melaporkan postingan");
            }
        } catch (error) {
            console.error("Gagal mengirim laporan:", error);
            alert("Terjadi kesalahan. Silakan coba lagi.");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!caption.trim() || !kategori) {
            setError("Konten dan kategori tidak boleh kosong.");
            return;
        }

        const formData = new FormData();
        formData.append("konten", caption);
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
            setCaption("");
            setFoto(null);
            setKategori("");
        } catch (err) {
            setError("Gagal mengirim postingan. Pastikan server berjalan.");
        }
    };

    const toggleLike = async (postId: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/like/${postId}`,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? { ...post, like: response.data.like, isLiked: !post.isLiked }
                            : post
                    )
                );

                setLikedPosts((prev) =>
                    prev.includes(postId)
                        ? prev.filter((id) => id !== postId) // Jika sudah like, hapus dari state
                        : [...prev, postId] // Jika belum like, tambahkan ke state
                );
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleSortChange = (sortType: string) => {
        setSortBy(sortType);
        fetchPosts(kategoriFilter); // Ambil postingan baru sesuai sorting
    };

    useEffect(() => {
        fetchUser();
        fetchPosts(kategoriFilter);
    }, [kategoriFilter, sortBy]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-grow flex flex-col items-start mt-6 ml-5">
                <h1 className="text-3xl font-bold text-center text-white mb-6 ml-96">
                    <p className="text-black">Kick<span className="text-yellow-600">Talk</span></p>
                </h1>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <div className="w-[800px] bg-white py-4 rounded-lg mb-5 ml-7">
                    <div
                        onClick={() => setIsOpen(true)}
                        className="flex items-center p-3 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition duration-300"
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
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex justify-center items-center">
                            <div className="bg-white w-[500px] p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4">Buat Postingan Baru</h2>
                                <form onSubmit={handleSubmit}>
                                    <textarea
                                        name="caption"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
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

                <div className='ml-9 mb-5'>
                    <button
                        className={`rounded border text-[20px] w-[100px] ${sortBy === "terbaru" ? "bg-gray-500 text-white" : ""}`}
                        onClick={() => handleSortChange("terbaru")}
                    >
                        Terbaru
                    </button>

                    <button
                        className={`ml-4 rounded border text-[20px] w-[100px] ${sortBy === "populer" ? "bg-gray-500 text-white" : ""}`}
                        onClick={() => handleSortChange("populer")}
                    >
                        Populer
                    </button>
                </div>

                <div className="w-[800px] space-y-4 ml-7">
                    {posts.length === 0 ? (
                        <p className="text-center text-gray-500">Tidak ada postingan.</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-white p-6 rounded-lg shadow-lg border hover:shadow-2xl transition duration-300">
                                <div className="flex justify-between">
                                    <Link href={`/User/Profile/${post.user.id}`} className="flex items-center">
                                        <img
                                            src={post.user?.fotoProfil ? `${apiUrl}${post.user.fotoProfil}` : "/default-avatar.png"}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full mr-2 object-cover"
                                        />
                                        <div>
                                            <span className="text-[18px] hover:underline">{post.user?.username}</span>
                                            <p className='text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full w-max'>
                                                {post.waktu}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Tombol opsi titik tiga */}
                                    <button onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)} className="text-gray-600 hover:text-gray-900">
                                        ⋮
                                    </button>

                                    {selectedPostId === post.id && (
                                        <div className="absolute top-10 right-4 bg-white border rounded-lg shadow-md p-2">
                                            <button
                                                className="text-sm text-red-500 hover:text-red-700"
                                                onClick={() => setShowModalForPost(showModalForPost === post.id ? null : post.id)}
                                            >
                                                Laporkan Postingan
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p className="mt-2">{post.caption}</p>
                                {post.foto && (
                                    <img src={`${apiUrl}${post.foto}`} alt={`Foto ${post.id}`} className="w-[600px] h-[500px] rounded-md mt-4" />
                                )}

                                <div className="flex items-center space-x-4 mt-4">
                                    <button
                                        onClick={() => toggleLike(post.id)}
                                        className={`flex items-center space-x-1 transition-transform duration-200 transform hover:scale-110 ${post.isLiked ? "text-blue-500" : "text-gray-600 hover:text-blue-500"
                                            }`}
                                    >
                                        👍 <span className="text-sm">{post.like}</span>
                                    </button>
                                    <button className="flex items-center space-x-1 transition-transform duration-200 transform hover:scale-110 text-gray-600 hover:text-blue-500"
                                        onClick={() => router.push(`/User/PostinganDetail/${post.id}`)}>
                                        💬 Komentar ({post?.jumlahKomentar || 0})
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal laporan */}
                {selectedPost && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold">Laporkan Postingan</h2>
                            <p className="text-sm text-gray-600">Pilih alasan pelaporan:</p>
                            <div className="mt-2">
                                {alasanLaporan.map((alasan, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id={`alasan-${selectedPost.id}-${index}`}
                                            name={`alasan-${selectedPost.id}`}
                                            value={alasan}
                                            onChange={(e) =>
                                                setSelectedAlasan((prev) => ({
                                                    ...prev,
                                                    [selectedPost.id]: String(e.target.value) // Pastikan nilainya string
                                                }))
                                            }
                                        />
                                        <label htmlFor={`alasan-${selectedPost.id}-${index}`} className="text-sm">{alasan}</label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowModalForPost(null)}>Batal</button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={laporkanPostingan}
                                    disabled={!selectedAlasan[selectedPost.id]}
                                >
                                    Kirim Laporan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
