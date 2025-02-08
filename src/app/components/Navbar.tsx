import React from 'react';
import Link from 'next/link';

function Navbar() {
    return (
        <div className='sticky top-0 bg-[#000957] grid grid-cols-2 justify-between shadow-md'>
            <div className='flex justify-start text-[25px] font-bold'>
                <p className='ml-6 mt-2 text-white'>Kick<span className='text-yellow-500'>Talk</span></p>
            </div>
            <div className='flex justify-end text-white items-center'>
                <Link href={'/HomePage'} className='text-[18px] font-normal'>
                    <p className='m-2 mr-5 hover:text-yellow-500'>Home</p>
                </Link>
                <Link href={'/'} className='text-[18px] font-normal'>
                    <p className='m-2 mr-5 hover:text-yellow-500'>Postingan Disimpan</p>
                </Link>
                <Link href={'/'} className='text-[18px] font-normal'>
                    <img src="../image/notifications.svg" className='mr-5 w-[25px] hover:bg-red-700' alt="Icon Notifikasi" />
                </Link>
                <Link href={'/'} className='text-[18px] font-normal'>
                    <img src="../image/notifications.svg" className='mr-5 w-[25px]' alt="Logo" />
                </Link>
            </div>
        </div>
    );
};


export default Navbar;
