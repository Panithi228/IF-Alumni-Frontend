'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import AddPostModal from "./Modal/addPostModal";
import EditPostModal from "./Modal/editPostModal";

const PostLists = () => {
    const [addPostModalOpen, setAddPostModalOpen] = useState(false);
    const [editPostModalOpen, setEditPostModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const openAddPostModal = () => {
        setAddPostModalOpen(!addPostModalOpen);
    }

    const openEditPostModal = () => {
        setEditPostModalOpen(!editPostModalOpen);
    }

    // Lists of Alumni
    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:8000/wp-json/wp/v2/posts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            setPosts(data);
            console.log(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        fetchPosts();
    }, []);
    
    return (
        <>
            <div className="max-w-6xl mx-auto p-6">
                {/* Header Section */}
                <div className="flex justify-end items-center mb-8 pb-4">
                    <button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        onClick={openAddPostModal}
                    >
                        <span className="text-xl">+</span> Add Alumni
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center my-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Featured Image Area */}
                                <div className="h-48 bg-gray-200 overflow-hidden relative">

                                    {/* ยังแสดงภาพไม่ได้เดี๋ยวมาแก้ไข */}
                                    {/* <img 
                                        src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/400x250?text=No+Image'} 
                                        alt={post.title.rendered}
                                        className="w-full h-full object-cover"
                                    /> */}

                                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                                        {post.status}
                                    </span>
                                </div>

                                {/* Content Area */}
                                <Link href={`/about/${post.id}`} className="block">
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
                                        <p className="text-sm text-gray-500 mb-4">ID: #{post.id}</p>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openEditPostModal();
                                                }}
                                                className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold py-2 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 rounded-lg transition-colors border border-red-200 cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                {addPostModalOpen && <AddPostModal handleCloseEvent={openAddPostModal} />}
                {editPostModalOpen && <EditPostModal handleCloseEvent={openEditPostModal} />}
            </div>
        </>
    )
}

export default PostLists;