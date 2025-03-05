import React from 'react'
import SidebarAdmin from '@/app/components/SidebarAdmin'

function Dashboard() {
    return (
        <div className='flex min-h-screen'>
            <SidebarAdmin />

            <div className='items-center'>
                <h1 className='ml-[450px] mt-2 font-bold text-[30px]'>Dashboard</h1>
                <div className='card border rounded-lg items-center w-[1050px] ml-10'>
                    <div className='flex grid-cols-3'>
                        <div className='card w-[350px] border rounded-lg m-3 text-center'>
                            <p>Jumlah User</p>
                            <p>1</p>
                        </div>
                        <div className='card w-[350px] border rounded-lg m-3 text-center'>
                            <p>Jumlah Postingan</p>
                            <p>2</p>
                        </div>
                        <div className='card w-[350px] border rounded-lg m-3 text-center'>
                            <p>Jumlah</p>
                            <p>3</p>
                        </div>
                    </div>
                    <div className=''>
                        <h1 className='ml-3 text-[20px] font-bold'>Statistik User</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
