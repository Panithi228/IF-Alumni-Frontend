'use client'

import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

type Props = {
    handleCloseEvent: () => void;
    fetchDataEvent: () => void;
}

const AddDonationModal = ({ handleCloseEvent, fetchDataEvent}: Props) => {
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [projectName, setProjectName] = useState('');
    const [projectInfo, setProjectInfo] = useState('');
    const [taxDeduction, setTaxDeduction] = useState('');
    const fileInputRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_BASE_URL = 'http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2'

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (!projectName || !projectInfo || !taxDeduction) {
            Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            let uploadedImageId = null;

            if (featuredImage) {
                const imageFormData = new FormData();
                imageFormData.append('file', featuredImage, featuredImage.name);
                imageFormData.append('title', projectName);

                const imgResponse = await fetch(`${API_BASE_URL}/media`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Disposition': `attachment; filename="${featuredImage.name}"`,
                    },
                    body: imageFormData,
                });

                if (imgResponse.ok) {
                    const imgData = await imgResponse.json();
                    uploadedImageId = imgData.id;
                } else {
                    console.warn('Image upload failed:', await imgResponse.text());
                }
            }

            const formData = new FormData();
            formData.append('title', projectName);
            formData.append('status', 'publish');
            formData.append('acf[project_name]', projectName);
            formData.append('acf[project_info]', projectInfo);
            formData.append('acf[tax_deduction]', taxDeduction);

            if (uploadedImageId) {
                formData.append('featured_media', String(uploadedImageId));
            }

            const response = await fetch(`${API_BASE_URL}/project`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Successfully submitted:', data);
                await Swal.fire({
                    icon: 'success',
                    title: 'ส่งข้อมูลสำเร็จ',
                    text: 'ข้อมูลและรูปภาพของคุณถูกส่งเข้าระบบแล้ว',
                });
                fetchDataEvent();
                handleCloseEvent();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Submission failed');
            }
        } catch (error: any) {
            console.error('Error:', error);
            Swal.fire('Error', error.message || 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
        setFeaturedImage(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">เพิ่มโครงการใหม่</h2>

                <form onSubmit={handleSubmit}>
                    
                    {/* Upload */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            อัปโหลดรูปภาพ <span className="text-red-500">*</span>
                        </label>
                        <div
                            onClick={handleClick}
                            className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition ${
                                featuredImage ? 'border-green-500 bg-green-50' : 'border-gray-300 text-gray-400 hover:border-blue-900'
                            }`}
                        >
                            <div className={`${featuredImage ? 'bg-green-500' : 'bg-blue-900'} p-4 rounded-xl mb-2`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4a2 2 0 012.828 0L16 17m-2-2l1-1a2 2 0 012.828 0L20 16" />
                                </svg>
                            </div>
                            <p className="text-sm">
                                {featuredImage ? `เลือกรูปแล้ว: ${featuredImage.name}` : 'เลือกรูปจากเครื่อง'}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            หัวข้อโครงการ <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="กรุณากรอกชื่อโครงการ"
                            className="w-full border rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            ข้อมูลรายละเอียดของโครงการ <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            placeholder="กรุณาระบุข้อมูลโครงการ"
                            className="w-full border rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
                            value={projectInfo}
                            onChange={(e) => setProjectInfo(e.target.value)}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium">
                            การลดหย่อนภาษี <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    required
                                    type="radio"
                                    name="tax"
                                    value="1"
                                    checked={taxDeduction === "1"}
                                    onChange={(e) => setTaxDeduction(e.target.value)}
                                />
                                ลดหย่อนภาษี 1 เท่า
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="tax"
                                    value="2"
                                    checked={taxDeduction === "2"}
                                    onChange={(e) => setTaxDeduction(e.target.value)}
                                />
                                ลดหย่อนภาษี 2 เท่า
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleCloseEvent}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-300 transition cursor-pointer"
                        >
                            กลับ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 text-white py-3 rounded-full font-medium transition ${
                                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-900 cursor-pointer'
                            }`}
                        >
                            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยัน'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDonationModal;