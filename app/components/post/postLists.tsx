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
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNotiModalOpen, setIsNotiModalOpen] = useState(false);
    const publishedAlumni = posts.filter(post => post.status === 'publish' || post.status === 'draft');
    const draftAlumni = posts.filter(post => post.status === 'pending');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('ทั้งหมด');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const DEFAULT_IMAGE = `${process.env.NEXT_PUBLIC_API_URL}/wp-content/uploads/2026/04/user-icon-fake-photo-sign-profile-button-simple-style-social-media-poster-background-symbol-user-brand-logo-design-element-user-t-shirt-printing-for-sticker-free-vector.jpg`;

    const openAddPostModal = () => setAddPostModalOpen(!addPostModalOpen);
    
    const openEditPostModal = (id = null) => {
        setSelectedPostId(id);
        setEditPostModalOpen(!editPostModalOpen);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'publish': return 'bg-green-500';
            case 'draft': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    }

    const MAJOR_MAP: Record<string, string> = {
        'CS': 'สาขาวิชาวิทยาการคอมพิวเตอร์',
        'ITDI': 'สาขาวิชาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
        'SE': 'สาขาวิชาวิศวกรรมซอฟต์แวร์',
        'AAI': 'สาขาวิชาปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
    };

    const fetchPosts = async (pageNum = 1, reset = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const activeToken = token || window.localStorage.getItem('jwtToken');

        try {
            const url = activeToken
                ? `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/alumni?status=publish,pending,draft&per_page=100&page=${pageNum}&_embed`
                : `${process.env.NEXT_PUBLIC_API_URL}/wp-json/alumni-api/v1/alumni-all?per_page=100&page=${pageNum}&_embed`;

            const response = await fetch(url, {
                headers: activeToken ? { Authorization: 'Bearer ' + activeToken } : {}
            });

            const totalPages = Number(response.headers.get('X-WP-TotalPages'));
            const data = await response.json();

            setPosts(prev => reset || pageNum === 1 ? data : [...prev, ...data]);
            setHasMore(pageNum < totalPages);
            setPage(pageNum);
        } catch (error) {
            console.error(error);
            if (pageNum === 1) setPosts([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const getFeaturedImageUrl = (post: any) => {
        if (post._embedded && post._embedded['wp:featuredmedia']) {
            return post._embedded['wp:featuredmedia'][0]?.source_url || DEFAULT_IMAGE;
        }
        return DEFAULT_IMAGE;
    }

    const handleApprove = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการอนุมัติ?',
            text: "รายการนี้จะถูกเผยแพร่ไปยังหน้าเว็บไซต์ทันที",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1565C0',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, อนุมัติเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังดำเนินการ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/alumni/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken') },
                    body: JSON.stringify({ status: 'publish' })
                });
                if (response.ok) {
                    await Swal.fire({ icon: 'success', title: 'อนุมัติเรียบร้อย!', showConfirmButton: false, timer: 1500 });
                    fetchPosts();
                } else throw new Error('Server response was not ok');
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอนุมัติได้ในขณะนี้', 'error');
            }
        }
    }

    const handleReject = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "รายการนี้จะถูกย้ายไปยังถังขยะ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังดำเนินการ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/alumni/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken') }
                });
                if (response.ok) {
                    await Swal.fire({ icon: 'success', title: 'ลบเรียบร้อย!', showConfirmButton: false, timer: 1500 });
                    fetchPosts();
                } else throw new Error('Delete failed');
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบได้ในขณะนี้', 'error');
            }
        }
    };

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
            Swal.fire({ title: 'กำลังดำเนินการ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/alumni/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken') },
                    body: JSON.stringify({ status: 'draft' })
                });
                if (response.ok) {
                    await Swal.fire({ icon: 'success', title: 'ซ่อนเรียบร้อย!', showConfirmButton: false, timer: 1500 });
                    fetchPosts();
                } else throw new Error('Server response was not ok');
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถซ่อนได้ในขณะนี้', 'error');
            }
        }
    };

    const handleShow = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการแสดง?',
            text: "รายการนี้จะถูกเผยแพร่ (Publish)",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังดำเนินการ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/alumni/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken') },
                    body: JSON.stringify({ status: 'publish' })
                });
                if (response.ok) {
                    await Swal.fire({ icon: 'success', title: 'เผยแพร่เรียบร้อย!', showConfirmButton: false, timer: 1500 });
                    fetchPosts();
                } else throw new Error('Server response was not ok');
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถแสดงได้ในขณะนี้', 'error');
            }
        }
    };

    const filteredAlumni = publishedAlumni
        .filter(post => {
            const name = post.title?.rendered?.toLowerCase() ?? '';
            const major = MAJOR_MAP[post.acf?.major] ?? post.acf?.major ?? '';
            const matchName  = name.includes(search.toLowerCase());
            const matchMajor = selectedMajor === 'ทั้งหมด' || major === selectedMajor;
            return matchName && matchMajor;
        })
        .sort((a, b) =>
            sortOrder === 'desc'
                ? (b.acf?.graduation_year ?? 0) - (a.acf?.graduation_year ?? 0)
                : (a.acf?.graduation_year ?? 0) - (b.acf?.graduation_year ?? 0)
        );

    useEffect(() => {
        fetchPosts(1, true);
    }, [token]);

    return (
        <div className="bg-gray-50 min-h-screen px-8 py-8">
            <Notification
                isOpen={isNotiModalOpen} 
                onClose={() => setIsNotiModalOpen(false)} 
                drafts={draftAlumni} 
                onApprove={token ? handleApprove : undefined} 
                onReject={token ? handleReject : undefined}
            />

            {/* ── Header ── */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
                {/* Navy banner with gold line */}
                <div className="h-2 bg-[#0D2B5E] relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F9C900]" />
                </div>
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Alumni Directory</h1>
                        <p className="text-xs text-gray-400 mt-0.5">คณะวิทยาการสารสนเทศ · บูรพา</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* Add Alumni */}
                        <button
                            className="bg-[#0D2B5E] hover:bg-[#1565C0] text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                            onClick={openAddPostModal}
                        >
                            <span className="text-lg leading-none">+</span> เพิ่ม Alumni
                        </button>

                        {/* Notification bell */}
                        <button
                            onClick={() => setIsNotiModalOpen(true)}
                            className="relative p-2 text-gray-400 hover:text-[#1565C0] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {draftAlumni.length > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-bounce">
                                    {draftAlumni.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="bg-white rounded-2xl border border-white shadow-200 px-6 py-4 mb-6 flex flex-wrap gap-3">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อศิษย์เก่า..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                    />
                </div>

                {/* Major filter */}
                <select
                    value={selectedMajor}
                    onChange={e => setSelectedMajor(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 cursor-pointer outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                >
                    <option value="ทั้งหมด">ทุกสาขา</option>
                    {Object.values(MAJOR_MAP).map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                {/* Sort */}
                <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 hover:bg-blue-50 hover:border-[#1565C0] hover:text-[#1565C0] cursor-pointer whitespace-nowrap transition-colors"
                >
                    {sortOrder === 'desc' ? '↓ ปีล่าสุด' : '↑ ปีเก่าสุด'}
                </button>
            </div>

            {/* ── Card Grid ── */}
            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <div className="text-[#1565C0] text-base font-medium animate-pulse">กำลังโหลด...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filteredAlumni.length > 0 ? filteredAlumni.map((post) => (
                        <div key={post.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">

                            {/* Gold top accent */}
                            <div className="h-1 bg-[#F9C900]" />

                            {/* Image */}
                            <div className="h-70 bg-gray-100 overflow-hidden relative">
                                <img
                                    src={getFeaturedImageUrl(post)}
                                    alt={post.title.rendered}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {token && (
                                    <span className={`absolute top-3 right-3 ${getStatusColor(post.status)} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm`}>
                                        {post.status}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <Link href={`/about/${post.id}`}>
                                    <h3
                                        className="text-lg font-semibold text-gray-900 mb-1 hover:text-[#1565C0] transition-colors"
                                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                    />
                                </Link>

                                {post.acf?.major && (
                                    <p className="text-xs text-[#1565C0] font-medium mb-2">
                                        {MAJOR_MAP[post.acf.major] || post.acf.major}
                                    </p>
                                )}

                                {/* Job + Company badges */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {post.acf?.job_position && (
                                        <span className="inline-flex items-center gap-1 bg-blue-50 text-[#0C447C] text-xs font-medium px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
                                            {post.acf.job_position}
                                        </span>
                                    )}
                                    {post.acf?.workplace && (
                                        <span className="inline-flex items-center gap-1 bg-blue-50 text-[#0C447C] text-xs font-medium px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
                                            {post.acf.workplace}
                                        </span>
                                    )}
                                </div>

                                {/* Show / Hide buttons */}
                                {token && (
                                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleShow(post.id)}
                                            disabled={post.status === 'publish'}
                                            className={`flex-1 text-sm font-semibold py-2 rounded-xl border transition
                                                ${post.status === 'publish'
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300 cursor-pointer'
                                                }`}
                                        >
                                            Show
                                        </button>
                                        <button
                                            onClick={() => handleHide(post.id)}
                                            disabled={post.status === 'draft'}
                                            className={`flex-1 text-sm font-semibold py-2 rounded-xl border transition
                                                ${post.status === 'draft'
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-300 cursor-pointer'
                                                }`}
                                        >
                                            Hide
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-16 text-gray-400 text-sm">
                            ไม่พบข้อมูลศิษย์เก่า
                        </div>
                    )}

                    {hasMore && (
                        <div className="col-span-full flex justify-center mt-4">
                            <button
                                onClick={() => fetchPosts(page + 1)}
                                disabled={loadingMore}
                                className="bg-[#0D2B5E] hover:bg-[#1565C0] text-white px-8 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:bg-gray-300 cursor-pointer"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        กำลังโหลด...
                                    </span>
                                ) : 'โหลดเพิ่มเติม'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {addPostModalOpen && (
                <AddPostModal handleCloseEvent={openAddPostModal} fetchDataEvent={fetchPosts} />
            )}
            {editPostModalOpen && (
                <EditPostModal postId={selectedPostId} handleCloseEvent={() => openEditPostModal(null)} fetchDataEvent={fetchPosts} />
            )}
        </div>
    );
}

export default PostLists;