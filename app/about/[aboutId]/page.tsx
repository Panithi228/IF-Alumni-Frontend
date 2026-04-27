'use client';

import { use, useEffect, useState } from "react";
import EditPostModal from "../../components/post/Modal/editPostModal";

export default function AboutId({ params }: { params: Promise<{ aboutId: string }> }) {
    const resolvedParams = use(params);
    const aboutId = resolvedParams.aboutId;
    const [editPostModalOpen, setEditPostModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [post, setPost] = useState<any>(null);

    const DEFAULT_IMAGE = `http://localhost:8041/wp-content/uploads/2026/04/user-icon-fake-photo-sign-profile-button-simple-style-social-media-poster-background-symbol-user-brand-logo-design-element-user-t-shirt-printing-for-sticker-free-vector.jpg`;

    const getImage = (post: any) => {
        if (post?._embedded?.['wp:featuredmedia']) {
            return post._embedded['wp:featuredmedia'][0].source_url;
        }
        return DEFAULT_IMAGE;
    };

    const openEditPostModal = (id = null) => {
        setSelectedPostId(id);
        setEditPostModalOpen(!editPostModalOpen);
    };

    const MAJOR_MAP: Record<string, string> = {
        'CS': 'สาขาวิชาวิทยาการคอมพิวเตอร์',
        'ITDI': 'สาขาวิชาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
        'SE': 'สาขาวิชาวิศวกรรมซอฟต์แวร์',
        'AAI': 'สาขาวิชาปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
    };

    const fetchPost = async () => {
        try {
            const token = window.localStorage.getItem('jwtToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/alumni/${aboutId}?_embed`,
                { headers: token ? { Authorization: 'Bearer ' + token } : {} }
            );
            const data = await res.json();
            setPost(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [aboutId]);

    if (!post) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-[#1565C0] text-lg font-medium animate-pulse">กำลังโหลด...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-50 min-h-screen px-8 py-8 gap-5 w-full">

            {/* ── Profile Card ── */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

                {/* Banner */}
                <div className="h-36 bg-[#0D2B5E] relative">
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F9C900]" />
                </div>

                {/* Avatar + Name row */}
                <div className="px-8 flex items-end gap-6 -mt-20 relative">
                    {/* Avatar */}
                    <div className="w-40 h-40 rounded-full border-4 border-white ring-2 ring-[#1565C0] overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                            src={getImage(post)}
                            alt="profile"
                            className="w-full h-full object-cover object-top"
                        />
                    </div>

                    {/* Name + badges */}
                    <div className="pb-3">
                        <h2
                            className="text-2xl font-medium text-gray-900"
                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0C447C] text-xs font-medium px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
                                {post.acf?.job_position}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0C447C] text-xs font-medium px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
                                {post.acf?.workplace}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 mx-6 my-4" />

                {/* Info section */}
                <div className="px-6 pb-5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-gray-100">
                        ข้อมูลการศึกษา
                    </p>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1565C0] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 8.22V15l7 3.83L19 15v-3.78l-7 3.83-7-3.83z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 leading-tight">คณะวิทยาการสารสนเทศ</p>
                            <p className="text-xs text-gray-500 mt-0.5">{MAJOR_MAP[post.acf?.major] || post.acf?.major}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'ปีการศึกษา', value: post.acf?.graduation_year },
                            { label: 'ตำแหน่ง', value: post.acf?.job_position },
                            { label: 'บริษัท', value: post.acf?.workplace },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">{label}</p>
                                <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content / Blog Card ── */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="h-1 bg-[#F9C900]" />

                <div className="border-b border-gray-100 px-6 py-4">
                    <h2
                        className="text-2xl font-medium text-gray-900"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                </div>

                <div
                    className="px-6 py-5 text-[15px] leading-loose text-[#4A5F7A] whitespace-pre-line break-words"
                    dangerouslySetInnerHTML={{ __html: post.acf?.additional_info }}
                />
            </div>

            {/* ── Edit Button ── */}
            <div className="flex justify-end">
                <button
                    onClick={() => openEditPostModal(post.id)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold py-2.5 px-10 rounded-xl transition-colors border border-amber-300 cursor-pointer"
                >
                    Edit
                </button>
            </div>

            {editPostModalOpen && (
                <EditPostModal
                    postId={selectedPostId}
                    handleCloseEvent={() => openEditPostModal(null)}
                    fetchDataEvent={fetchPost}
                />
            )}
        </div>
    );
}