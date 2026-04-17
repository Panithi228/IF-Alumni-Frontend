'use client'

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

type Props = {
    postId: number | null;
    handleCloseEvent: () => void;
    fetchDataEvent: () => void;
};

const EditPostModal = ({ postId, handleCloseEvent, fetchDataEvent }: Props) => {
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [major, setMajor] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [email, setEmail] = useState('');
    const [jobPosition, setJobPosition] = useState('');
    const [workplace, setWorkplace] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [status, setStatus] = useState('publish');
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [originalStudentId, setOriginalStudentId] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');

    const API_BASE_URL = 'http://localhost:8000/wp-json';

    useEffect(() => {
        const fetchCurrentPost = async () => {
            if (!postId) return;
            try {
                const token = window.localStorage.getItem('jwtToken');
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = 'Bearer ' + token;

                const response = await fetch(`http://localhost:8000/wp-json/wp/v2/alumni/${postId}?_embed`, { headers });
                const data = await response.json();

                setFullName(data.title.rendered || '');
                setStatus(data.status);

                if (data.acf) {
                    setMajor(data.acf.major || '');
                    setGraduationYear(data.acf.graduation_year || '');
                    setJobPosition(data.acf.job_position || '');
                    setWorkplace(data.acf.workplace || '');
                    setAdditionalInfo(data.acf.additional_info || '');
                    setOriginalStudentId(data.acf.student_id || '');
                    setOriginalEmail(data.acf.email || '');
                }
                
                if (data.acf && token) {
                    setStudentId(data.acf.student_id || '');
                    setEmail(data.acf.email || '');
                }

                if (data._embedded && data._embedded['wp:featuredmedia']) {
                    setCurrentImageUrl(data._embedded['wp:featuredmedia'][0].source_url);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลได้', 'error');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchCurrentPost();
    }, [postId]);

    const handleImageUpload = async (image: File) => {
        const formData = new FormData();
        formData.append('file', image);
        const response = await fetch('http://localhost:8000/wp-json/wp/v2/media', {
            method: 'POST',
            headers: { 
                'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken')
            },
            body: formData
        });
        const data = await response.json();
        return data.id;
    };

    //Handle form submission
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });

        try {
            const formData = new FormData();
            const token = window.localStorage.getItem('jwtToken');

            formData.append('title', fullName);
            
            formData.append('check_student_id', studentId); 
            formData.append('check_email', email);

            if (featuredImage) {
                formData.append('featured_image', featuredImage);
            }

            formData.append('acf[full_name]', fullName);
            formData.append('acf[major]', major);
            formData.append('acf[graduation_year]', graduationYear);
            formData.append('acf[job_position]', jobPosition);
            formData.append('acf[workplace]', workplace);
            formData.append('acf[additional_info]', additionalInfo);

            const url = `${API_BASE_URL}/alumni-api/v1/update/${postId}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                await Swal.fire({ icon: 'success', title: 'อัปเดตเรียบร้อย', text: 'กรุณารอข้อมูลอัปเดตสักครู่' });
                fetchDataEvent();
                handleCloseEvent();
            } else {
                throw new Error(result.message || 'ข้อมูลยืนยันไม่ถูกต้อง');
            }
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Alumni Information</h2>
                    <span className="text-xs font-mono text-gray-400">ID: #{postId}</span>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">ชื่อ - นามสกุล</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">รหัสนิสิต</label>
                            <input required type="text" className="border rounded-lg w-full p-2" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">สาขาวิชา</label>
                            <select 
                                className="border rounded-lg w-full p-2 bg-white" 
                                value={major} 
                                onChange={(e) => setMajor(e.target.value)}
                            >
                                <option value="" disabled hidden>เลือกสาขาวิชา</option>
                                <option value="CS">สาขาวิชาวิทยาการคอมพิวเตอร์</option>
                                <option value="ITDI">สาขาวิชาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล</option>
                                <option value="SE">สาขาวิชาวิศวกรรมซอฟต์แวร์</option>
                                <option value="AAI">สาขาวิชาปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">รุ่นปีการศึกษา</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">อีเมล</label>
                            <input required type="email" className="border rounded-lg w-full p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">ตำแหน่งงาน</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1">สถานที่ทำงาน</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={workplace} onChange={(e) => setWorkplace(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">ข้อมูลเพิ่มเติม</label>
                        <textarea className="border rounded-lg w-full p-2 h-24" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)}></textarea>
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-sm font-semibold mb-2">รูปถ่ายของท่าน</label>
                        <div className="flex items-center gap-4">
                            {currentImageUrl && !featuredImage && (
                                <img src={currentImageUrl} alt="Current" className="w-16 h-16 object-cover rounded-lg border" />
                            )}
                            <input 
                                type="file" 
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                onChange={(e) => setFeaturedImage(e.target.files ? e.target.files[0] : null)}  
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">*เลือกไฟล์ใหม่หากต้องการเปลี่ยนรูปภาพ</p>
                    </div>

                    <div className="flex justify-end mt-6 gap-3">
                        <button 
                            type="button"
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            onClick={handleCloseEvent}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className={`px-6 py-2 rounded-lg text-white font-semibold transition-all ${isSubmitting ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} cursor-pointer`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Alumni'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditPostModal;