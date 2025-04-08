'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '../components/Footer';

function Index() {
    return (
        <div className='min-h-screen flex flex-col justify-between'>
            <div className="p-2 text-[30px] font-bold border-b text-center bg-white text-black">
                Kick<span className="text-yellow-500">Talk</span>
            </div>

            <div className='flex-1 flex flex-col justify-center items-center text-center px-4'>
                <h1 className='text-[35px] font-bold mb-3'>Selamat Datang di KickTalk!</h1>
                <p className='text-[18px] max-w-xl'>
                    KickTalk adalah forum online bagi para pecinta olahraga dari berbagai kalangan.
                    Di sini, kamu bisa berbagi cerita, bertukar opini, hingga berdiskusi seru tentang
                    berita, pemain favorit, prediksi pertandingan, hingga segala hal seputar dunia olahraga!
                </p>
                <p className='text-[18px] mt-2 max-w-xl'>
                    Gabung dan temukan teman baru yang punya passion sama dalam dunia olahraga.
                    Mulai dari sepak bola, basket, bulutangkis, hingga e-sport — semua ada di KickTalk!
                </p>

                <Link href='/Login'>
                    <button className='rounded-md border mt-5 px-4 py-2 text-[17px] text-white bg-yellow-500 hover:bg-yellow-700 transition-all duration-200'>
                        Gabung & Mulai Diskusi
                    </button>
                </Link>
            </div>

            <Footer />
        </div>
    )
}

export default Index;
