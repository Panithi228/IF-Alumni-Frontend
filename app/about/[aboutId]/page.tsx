'use client';

import { use, useEffect, useState } from "react";
import EditPostModal from "../../components/post/Modal/editPostModal";

export default function AboutId({ params }: { params: Promise<{ aboutId: string }> }) {
    const resolvedParams = use(params);
    const aboutId = resolvedParams.aboutId;
    const [editPostModalOpen, setEditPostModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null); 

    const [post, setPost] = useState<any>(null);

    const DEFAULT_IMAGE = 'http://dekdee2.informatics.buu.ac.th:8041/wp-content/uploads/2026/04/user-icon-fake-photo-sign-profile-button-simple-style-social-media-poster-background-symbol-user-brand-logo-design-element-user-t-shirt-printing-for-sticker-free-vector.jpg';

    const getImage = (post: any) => {
        if (post?._embedded?.['wp:featuredmedia']) {
            return post._embedded['wp:featuredmedia'][0].source_url;
        }
        return DEFAULT_IMAGE;
    };

    const openEditPostModal = (id = null) => {
        setSelectedPostId(id);
        setEditPostModalOpen(!editPostModalOpen);
    }

    const MAJOR_MAP: Record<string, string> = {
        'CS': 'สาขาวิชาวิทยาการคอมพิวเตอร์',
        'ITDI': 'สาขาวิชาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
        'SE': 'สาขาวิชาวิศวกรรมซอฟต์แวร์',
        'AAI': 'สาขาวิชาปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
    };

    const fetchPost = async () => {
        try {
            const token = window.localStorage.getItem('jwtToken');

            const res = await fetch(`http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2/alumni/${aboutId}?_embed`,{
                    headers: token
                        ? { 
                        Authorization: 'Bearer ' + token 
                        } : {}
                }
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
        return <div className="text-center py-20">Loading...</div>;
    }

    return (
        <div className="flex flex-col max-w bg-gray-50 min-h-full">
            {/* Profile */}
            <div className=" p-10 flex align-items-center justify-center">
                <img 
                    src={getImage(post)}
                    className="w-80 h-80 object-cover rounded border"
                />

                <div className="flex flex-col gap-10 ml-50">
                    <h2 className="text-3xl font-bold " dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

                    <p className="text-2xl  font-medium">คณะวิทยาการสารสนเทศ {MAJOR_MAP[post.acf.major] || post.acf.major}</p>
                    <p className="text-2xl  font-medium">ปีการศึกษา {post.acf?.graduation_year}</p>
                    {/* <p>ระดับการศึกษา {post.acf?.degree}</p> */}
                    <p className="text-2xl  font-medium">ตำแหน่งงาน {post.acf?.job_position}</p>
                    <p className="text-2xl  font-medium">สถานที่ทำงาน {post.acf?.workplace}</p>

                    {/* 👇 status badge */}
                    {/* <span className={`inline-block mt-2 px-2 py-1 text-xs text-white rounded ${
                        post.status === 'publish'
                            ? 'bg-green-500'
                            : post.status === 'draft'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                    }`}>
                        {post.status}
                    </span> */}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl leading-loose min-h-100 mx-[15vw] border border-[#dde5f0] shadow-lg">
                <div className="bg-white border-b border-[#dde5f0] rounded-xl overflow-hidden">
                    <h2
                        className="text-6xl font-bold mb-4 m-2"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                </div>

                <div
                    className="px-6 py-5 text-[18px] leading-loose text-[#4A5F7A] whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: post.acf.additional_info }}
                />
            </div>

            <div className="flex bg-gray-50 justify-end p-6 mt-9">
                <button 
                    onClick={() => openEditPostModal(post.id)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-md font-semibold py-3 px-20 rounded-lg transition-colors border border-amber-400 cursor-pointer"
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