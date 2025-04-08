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
                    KickTalk adalah wadah komunitas online khusus bagi kamu para pecinta sepak bola dan futsal dari seluruh penjuru Indonesia.
                </p>
                <p className='text-[18px] mt-2 max-w-xl'>
                    Di sini, kamu bisa ngobrol seru seputar dunia si kulit bundar — mulai dari membahas pertandingan terbaru, transfer pemain, strategi permainan, sampai cerita seru di lapangan futsal bareng teman-teman satu hobi.
                </p>
                <p className='text-[18px] mt-2 max-w-xl'>
                    Nggak cuma itu, kamu juga bisa berdiskusi soal liga favorit, berbagi tips & trik bermain futsal, cari lawan tanding, bahkan saling tukar info seputar event atau turnamen terdekat!
                </p>
                <p className='text-[18px] mt-2 max-w-xl'>
                    Yuk gabung sekarang dan jadi bagian dari komunitas pecinta sepak bola & futsal paling seru! Di KickTalk, semua bisa jadi pemain utama dalam setiap obrolan!
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
