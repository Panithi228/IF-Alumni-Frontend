'use client'

import { useState } from "react";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

type Props = {
    handleCloseEvent: () => void;
    fetchDataEvent: () => void;
};

const AddPostModal = ({ handleCloseEvent, fetchDataEvent }: Props) => {
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [major, setMajor] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [email, setEmail] = useState('');
    const [jobPosition, setJobPosition] = useState('');
    const [workplace, setWorkplace] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    //Handle form submission
    const handleSingleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let featuredImageID = null;

            // Upload the featured image if it exists
            if (featuredImage) {
                featuredImageID = await handleFeaturedImageUpload(featuredImage);
            }
            
            const postData = {
                title: fullName,
                status: 'pending',
                featured_media: featuredImageID,
                acf: {
                    full_name: fullName,
                    student_id: studentId,
                    major: major,
                    graduation_year: graduationYear,
                    email: email,
                    job_position: jobPosition,
                    workplace: workplace,
                    additional_info: additionalInfo
                }
            }
            
            console.log(postData);

            try {
                const response = await fetch('http://localhost:8000/wp-json/wp/v2/alumni', {
                    'method': 'POST',
                    'headers': {
                        'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });

                const data = await response.json();
                console.log('Post created successfully: ', data);
                handleCloseEvent();
                fetchDataEvent();

            } catch (error) {
                console.log('Error creating post: ', error);
            }
            
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return Swal.fire('Error', 'กรุณาเลือกไฟล์', 'error');
        
        setIsSubmitting(true);
        Swal.fire({ 
            title: 'กำลังอ่านไฟล์ Excel...', 
            text: 'กรุณารอสักครู่',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading() 
        });

        try {
            const data = await uploadFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error('ไม่พบข้อมูลในไฟล์ Excel');
            }

            let successCount = 0;
            let errorCount = 0;

            for (const item of jsonData as any[]) {
                if (!item.full_name) continue;

                try {
                    const response = await fetch('http://localhost:8000/wp-json/wp/v2/alumni', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken'),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: item.full_name,
                            status: 'publish',
                            featured_media: Number(item.profile_image) || null,
                            acf: {
                                full_name: item.full_name,
                                student_id: item.student_id?.toString(),
                                major: item.major,
                                graduation_year: item.graduation_year?.toString(),
                                email: item.email,
                                job_position: item.job_position,
                                workplace: item.workplace,
                                additional_info: item.additional_info
                            }
                        })
                    });

                    if (response.ok) successCount++;
                    else errorCount++;

                } catch (err) {
                    console.error('Fetch error:', err);
                    errorCount++;
                }
            }

            setIsSubmitting(false);
            Swal.fire({
                icon: errorCount === 0 ? 'success' : 'warning',
                title: 'นำเข้าข้อมูลเรียบร้อย',
                text: `สำเร็จ ${successCount} รายการ, ล้มเหลว ${errorCount} รายการ`,
            }).then(() => {
                fetchDataEvent();
                handleCloseEvent();
            });

        } catch (error: any) {
            console.error('Excel Error:', error);
            Swal.fire('Error', error.message || 'ไม่สามารถอ่านไฟล์ Excel ได้', 'error');
            setIsSubmitting(false);
        }
    };

    const handleFeaturedImageUpload = async (image: File) => {
        try {
            const formData = new FormData();

            formData.append('file', image);
            formData.append('alt_text', 'Featured Image');

            const response = await fetch('http://localhost:8000/wp-json/wp/v2/media', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken'),
                },
                body: formData
            });

            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error('Error uploading featured image:', error);
        }
    }
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Alumni</h2>
                    
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('single')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'single' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Single Entry
                        </button>
                        <button 
                            onClick={() => setActiveTab('bulk')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'bulk' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Bulk Upload (.csv)
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto overflow-x-hidden">
            {/* --- Content: Single Entry --- */}
            {activeTab === 'single' ? (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Full Name</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Student ID</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Major</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={major} onChange={(e) => setMajor(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Graduation Year</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Email</label>
                            <input type="email" className="border rounded-lg w-full p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Job Position</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1">Workplace</label>
                            <input type="text" className="border rounded-lg w-full p-2" value={workplace} onChange={(e) => setWorkplace(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Additional Information</label>
                        <textarea className="border rounded-lg w-full p-2 h-24" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)}></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Featured Image</label>
                        <input 
                            type="file" 
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => setFeaturedImage(e.target.files ? e.target.files[0] : null)}  
                        />
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
                            className={`px-6 py-2 rounded-lg text-white font-semibold transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} cursor-pointer`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Save Alumni'}
                        </button>
                    </div>
                </form>
                ) : (
                        /* --- Content: Bulk Upload --- */
                        <form onSubmit={handleBulkSubmit} className="py-10 flex flex-col items-center border-2 border-dashed border-gray-200 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 mb-4">เลือกไฟล์ CSV ที่ต้องการอัปโหลด</p>
                            <input 
                                type="file" 
                                accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                className="mb-6 flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            />
                            <div className="text-xs text-gray-400 text-center px-10">
                                <p>* ไฟล์ควรมีหัวตารางตรงกับฟิลด์ในระบบ (full_name, student_id, major, ...)</p>
                            </div>

                            <div className="flex justify-center gap-3 mt-10 w-full px-6 pt-4">
                                <button type="button" onClick={handleCloseEvent} className="px-6 py-2 bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer">Start Upload</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddPostModal;