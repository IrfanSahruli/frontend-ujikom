'use client';

import React, { useState, useEffect } from 'react';
import SidebarAdmin from '@/app/components/SidebarAdmin';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

function Dashboard() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [userStats, setUserStats] = useState([]);
    const [totalPost, setTotalPost] = useState(0);
    const [postStats, setPostStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, userStatRes, postRes, postStatRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/totalUser`, { withCredentials: true }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistikUser`, { withCredentials: true }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/totalPostingan`, { withCredentials: true }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistikPostingan`, { withCredentials: true })
                ]);

                setTotalUsers(userRes.data.totalUsers);
                setUserStats(userStatRes.data.data);
                setTotalPost(postRes.data.totalPostingan);
                setPostStats(postStatRes.data.data);
            } catch (error) {
                console.error('Gagal mengambil data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='flex min-h-screen bg-gray-100'>
            <SidebarAdmin />

            <div className='flex-1 p-6'>
                <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card className='shadow-lg'>
                            <CardHeader className='flex flex-row justify-between items-center'>
                                <CardTitle>Jumlah User</CardTitle>
                                <User className='text-blue-500 w-8 h-8' />
                            </CardHeader>
                            <CardContent>
                                <p className='text-4xl font-bold'>{totalUsers}</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card className='shadow-lg'>
                            <CardHeader className='flex flex-row justify-between items-center'>
                                <CardTitle>Jumlah Postingan</CardTitle>
                                <FileText className='text-green-500 w-8 h-8' />
                            </CardHeader>
                            <CardContent>
                                <p className='text-4xl font-bold'>{totalPost}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Card className='shadow-lg'>
                        <CardHeader>
                            <CardTitle>Statistik User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={userStats}>
                                    <XAxis dataKey='bulan' />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey='jumlah' fill='#3b82f6' />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className='shadow-lg'>
                        <CardHeader>
                            <CardTitle>Statistik Postingan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width='100%' height={300}>
                                <BarChart data={postStats}>
                                    <XAxis dataKey='bulan' />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey='jumlah' fill='#10b981' />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
