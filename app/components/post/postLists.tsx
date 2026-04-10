'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import AddPostModal from "./Modal/addPostModal";
import EditPostModal from "./Modal/editPostModal";
import Notification from "../notification";
import Swal from 'sweetalert2';

type Props = {
    token: string | null;
};

const PostLists = ({token}: Props) => {
    const [addPostModalOpen, setAddPostModalOpen] = useState(false);
    const [editPostModalOpen, setEditPostModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNotiModalOpen, setIsNotiModalOpen] = useState(false);
    const publishedAlumni = posts.filter(post => post.status === 'publish' || post.status === 'draft');
    const draftAlumni = posts.filter(post => post.status === 'pending');

    const DEFAULT_IMAGE = 'http://localhost:8000/wp-content/uploads/2026/04/user-icon-fake-photo-sign-profile-button-simple-style-social-media-poster-background-symbol-user-brand-logo-design-element-user-t-shirt-printing-for-sticker-free-vector.jpg';

    const openAddPostModal = () => setAddPostModalOpen(!addPostModalOpen);
    
    const openEditPostModal = (id = null) => {
        setSelectedPostId(id);
        setEditPostModalOpen(!editPostModalOpen);
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'publish': return 'bg-green-500';
            case 'draft': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    }

    // Fetch Alumni Lists
    const fetchPosts = async () => {
        setLoading(true);

        try {
            const url = token
                ? 'http://localhost:8000/wp-json/wp/v2/alumni?status=publish,pending,draft&_embed'
                : 'http://localhost:8000/wp-json/wp/v2/alumni?status=publish&_embed';

            const response = await fetch(url, {
                headers: token
                    ? { Authorization: 'Bearer ' + token }
                    : {}
            });

            const data = await response.json();

            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const getFeaturedImageUrl = (post) => {
        if (post._embedded && post._embedded['wp:featuredmedia']) {
            return post._embedded['wp:featuredmedia'][0].source_url;
        }
        return DEFAULT_IMAGE;
    }

    // ฟังก์ชันสำหรับอนุมัติ
    const handleApprove = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการอนุมัติ?',
            text: "รายการนี้จะถูกเผยแพร่ไปยังหน้าเว็บไซต์ทันที",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, อนุมัติเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'กำลังดำเนินการ...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading(); 
                }
            });

            try {
                const response = await fetch(`http://localhost:8000/wp-json/wp/v2/alumni/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken')
                    },
                    body: JSON.stringify({ status: 'publish' })
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'อนุมัติเรียบร้อย!',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    fetchPosts();
                } else {
                    throw new Error('Server response was not ok');
                }
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอนุมัติได้ในขณะนี้', 'error');
            }
        }
    }

    const handleHide = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการซ่อน?',
            text: "รายการนี้จะถูกเปลี่ยนเป็นฉบับร่าง (Draft)",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ใช่, ซ่อนเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'กำลังดำเนินการ...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading(); 
                }
            });

            try {
                const response = await fetch(`http://localhost:8000/wp-json/wp/v2/alumni/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken')
                    },
                    body: JSON.stringify({ status: 'draft' })
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'ซ่อนเรียบร้อย!',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    fetchPosts();
                } else {
                    throw new Error('Server response was not ok');
                }
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถซ่อนได้ในขณะนี้', 'error');
            }
        }
    };
    
    // ฟังก์ชันสำหรับสร้าง JWT Token
    const generateJWTToken = async () => {
        try {
            const response = await fetch('http://localhost:8000/wp-json/jwt-auth/v1/token', {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    username: 'admin',
                    password: 'admin'
                })
            })

            const data = await response.json();
            window.localStorage.setItem('jwtToken', data.token);

            await validateJWTToken(data.token);
        } catch (error) {
            console.log("Error generating JWT token:", error);
        }
    }

    // ฟังก์ชันสำหรับตรวจสอบ JWT Token
    const validateJWTToken = async (token: string) => {
        try {
            const response = await fetch('http://localhost:8000/wp-json/jwt-auth/v1/token/validate', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'Bearer ' + token
                }
            })

            const data = await response.json();
        } catch (error) {
            console.log("Error validating JWT token:", error);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, [token]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            {token && (
                <Notification
                    isOpen={isNotiModalOpen} 
                    onClose={() => setIsNotiModalOpen(false)} 
                    drafts={draftAlumni} 
                    onApprove={token ? handleApprove : undefined} 
                />
            )}
            
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Alumni Directory</h1>

                <div className="flex gap-4">
                    {/* ปุ่มเพิ่ม Alumni */}
                    <button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        onClick={openAddPostModal}
                    >
                        <span className="text-xl">+</span> Add Alumni
                    </button>

                    {/* ปุ่ม Notification จะแสดงเมื่อทำการ login เท่านั้น */}
                    {token && (
                        <button 
                            onClick={() => setIsNotiModalOpen(true)}
                            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all cursor-pointer group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            
                            {/* Badge ตัวเลขสีแดง (จะแสดงเฉพาะเมื่อมี Pending) */}
                            {draftAlumni.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                                    {draftAlumni.length}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center my-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedAlumni.length > 0 ? publishedAlumni.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                            {/* Image Area */}
                            <div className="h-56 bg-gray-200 overflow-hidden relative">
                                <img 
                                    src={getFeaturedImageUrl(post)} 
                                    alt={post.title.rendered}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className={`absolute top-3 right-3 ${getStatusColor(post.status)} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm`}>
                                    {post.status}
                                </span>
                            </div>

                            {/* Content Area */}
                            <div className="p-5">
                                <Link href={`/about/${post.id}`}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 hover:text-indigo-600 transition-colors" 
                                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}>
                                    </h3>
                                </Link>
                                
                                {post.acf?.major && (
                                    <p className="text-sm text-indigo-600 font-medium mb-1">{post.acf.major}</p>
                                )}
                                <p className="text-xs text-gray-400 mb-4">Ref ID: #{post.id}</p>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openEditPostModal(post.id)}
                                        className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold py-2 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                                    >
                                        Edit
                                    </button>

                                    {/* ปุ่ม Hide จะแสดงก็ต่อเมื่อ login เท่านั้น */}
                                    {token && (
                                        <button 
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold py-2 rounded-lg transition-colors border border-red-200 cursor-pointer"
                                            onClick={() => handleHide(post.id)}
                                        >
                                            Hide
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No alumni found.
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {addPostModalOpen && (
                <AddPostModal 
                    handleCloseEvent={openAddPostModal} 
                    fetchDataEvent={fetchPosts} 
                />
            )}
            
            {editPostModalOpen && (
                <EditPostModal 
                    postId={selectedPostId}
                    handleCloseEvent={() => openEditPostModal(null)} 
                    fetchDataEvent={fetchPosts}
                />
            )}
        </div>
    );
}

export default PostLists;