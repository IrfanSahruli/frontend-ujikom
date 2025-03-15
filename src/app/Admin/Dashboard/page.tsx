'use client';

import React, { useState, useEffect } from 'react'
import SidebarAdmin from '@/app/components/SidebarAdmin'
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [userStats, setUserStats] = useState([]);
    const [totalPost, setTotalPost] = useState(0);
    const [postStats, setPostStats] = useState([]);

    const fetchTotalUsers = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/totalUser`, {
                withCredentials: true
            });
            setTotalUsers(response.data.totalUsers);
        } catch (error) {
            console.error('Gagal mengambil data jumlah user', error);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistikUser`, {
                withCredentials: true
            });
            setUserStats(response.data.data);
        } catch (error) {
            console.error('Gagal mengambil statistik user', error);
        }
    };

    const fetchTotalPost = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/totalPostingan`, {
                withCredentials: true
            });
            setTotalPost(response.data.totalPostingan);
        } catch (error) {
            console.error('Gagal mengambil data jumlah postingan', error);
        }
    };

    const fetchPostStats = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistikPostingan`, {
                withCredentials: true
            });
            setPostStats(response.data.data);
        } catch (error) {
            console.error('Gagal mengambil statistik postingan', error);
        }
    };

    useEffect(() => {
        fetchTotalUsers();
        fetchUserStats();
        fetchTotalPost();
        fetchPostStats();
    }, []);

    return (
        <div className='flex min-h-screen'>
            <SidebarAdmin />

            <div className='items-center'>
                <h1 className='ml-[450px] mt-2 font-bold text-[30px]'>Dashboard</h1>
                <div className='card border rounded-lg items-center w-[1050px] ml-10'>
                    <div className='flex grid-cols-2'>
                        <div className='card w-[500px] border rounded-lg m-3 text-center'>
                            <p>Jumlah User</p>
                            <p>{totalUsers}</p>
                        </div>
                        <div className='card w-[500px] border rounded-lg m-3 text-center'>
                            <p>Jumlah Postingan</p>
                            <p>{totalPost}</p>
                        </div>
                    </div>
                    <div className='mt-8'>
                        <h2 className='text-lg font-bold ml-4 mb-3'>Statistik User</h2>
                        <div className='bg-white p-5 rounded-lg'>
                            <ResponsiveContainer width={800} height={300}>
                                <BarChart data={userStats}>
                                    <XAxis dataKey="bulan" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="jumlah" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className='mt-8'>
                        <h2 className='text-lg font-bold ml-4 mb-3'>Statistik Postingan</h2>
                        <div className='bg-white p-5 shadow-lg rounded-lg'>
                            <ResponsiveContainer width={800} height={300}>
                                <BarChart data={postStats}>
                                    <XAxis dataKey="bulan" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="jumlah" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
