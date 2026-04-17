'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DonationId() {
    const { donationId } = useParams(); 
    const [project, setProject] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [donateAmount, setDonateAmount] = useState();
    const [receipt, setReceipt] = useState(true);
    const [donationType, setDonationType] = useState('');
    const [prefix, setPrefix] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [taxId, setTaxId] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [address, setAddress] = useState('');
    const [subDistrict, setSubDistrict] = useState('');
    const [district, setDistrict] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [donationEmail, setDonationEmail] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [donationReceipt, setDonationReceipt] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [receiptNo, setReceiptNo] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [today, setToday] = useState('');

    const DEFAULT_IMAGE = 'http://localhost:8000/wp-content/uploads/2026/04/user-icon-fake-photo-sign-profile-button-simple-style-social-media-poster-background-symbol-user-brand-logo-design-element-user-t-shirt-printing-for-sticker-free-vector.jpg';

    const getFeaturedImageUrl = (project) => {
        if (project._embedded && project._embedded['wp:featuredmedia']) {
            return project._embedded['wp:featuredmedia'][0].source_url;
        }
        return DEFAULT_IMAGE;
    }

    const handleSubmitDonation = async () => {
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append('project_id', donationId as string);
            formData.append('payment_method', paymentMethod);
            formData.append('amount', String(donateAmount));
            formData.append('receipt', receipt ? '1' : '0');
            formData.append('donation_type', donationType);
            formData.append('prefix', prefix);
            formData.append('full_name', fullName);
            formData.append('phone_number', phoneNumber);
            formData.append('tax_id', taxId);
            formData.append('email', donationEmail);
            formData.append('additional_info', additionalInfo);

            formData.append('house_number', houseNumber);
            formData.append('address', address);
            formData.append('sub_district', subDistrict);
            formData.append('district', district);
            formData.append('province', province);
            formData.append('postal_code', postalCode);


            if (donationReceipt) {
                formData.append('donation_receipt', donationReceipt);
            }

            const res = await fetch('http://localhost:8000/wp-json/alumni-api/v1/donation', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            setReceiptNo(data.receipt_no);
            setSubmitted(true);
            setStep(4);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/wp-json/wp/v2/project/${donationId}?_embed`);
                const data = await response.json();
                setProject(data);
            } catch (error) {
                console.error(error);
            }
        };

        if (donationId) { 
            fetchData(); 
        }
    }, [donationId]);

    useEffect(() => {
        const date = new Date().toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        setToday(date);
    }, []);

    if (!project) {
        return (
        <div className="h-screen flex items-center justify-center text-gray-500">
            Loading...
        </div>
        );
    }

    return (
    <div className='grid grid-cols-2 bg-gray-50 p-6 gap-4 w-full '>
        <div className="flex flex-col gap-4">
            <img
                src={getFeaturedImageUrl(project)}
                className="w-full h-120 object-cover rounded-xl shadow-sm"
                alt=""
            />
            <div className="px-2 border-b border-gray-400 pb-2">
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                    {project.acf.project_name}
                </h1>
                <span className='text-red-500 text-lg font-bold'>
                    สามารถลดหย่อนภาษีได้ {project.acf.tax_deduction} เท่า
                </span>
            </div>

            {/* Project Information */}
            <div className='flex justify-start items-start px-2 pb-2'>
                <h2 className='text-xl leading-loose'>
                    {project.acf.project_info}
                </h2>
            </div>
        </div>

        <div className="w-full bg-gray-100 p-4 rounded">
            <div className="w-full py-4">
                <div className="flex items-center">
                    {/* Step 1 */}
                    <div className="flex items-center text-indigo-800 relative">
                        <div className={`rounded-full transition duration-500 ease-in-out h-10 w-10 py-3 border-2 flex items-center justify-center font-bold ${step >= 1 ? "bg-indigo-800 border-indigo-800 text-white" : "border-gray-300 text-gray-500"}`}>
                            {step > 1 ? "✓" : "1"}
                        </div>
                    </div>

                    <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${step > 1 ? "border-indigo-800" : "border-gray-300"}`}></div>

                    {/* Step 2 */}
                    <div className="flex items-center relative">
                        <div className={`rounded-full transition duration-500 ease-in-out h-10 w-10 py-3 border-2 flex items-center justify-center font-bold ${step >= 2 ? "bg-indigo-800 border-indigo-800 text-white" : "border-gray-300 text-gray-500"}`}>
                            {step > 2 ? "✓" : "2"}
                        </div>
                    </div>

                    <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${step > 2 ? "border-indigo-800" : "border-gray-300"}`}></div>

                    {/* Step 3 */}
                    <div className="flex items-center relative">
                        <div className={`rounded-full transition duration-500 ease-in-out h-10 w-10 py-3 border-2 flex items-center justify-center font-bold ${step >= 3 ? "bg-indigo-800 border-indigo-800 text-white" : "border-gray-300 text-gray-500"}`}>
                            3
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Step 1 Form */}
            {step === 1 && (
                <div className='ml-6'>
                    <div className="mb-3 text-center md:text-left">
                        <h2 className="text-xl font-bold text-gray-800">ช่องทางการชำระเงิน</h2>
                    </div>

                    <div className="flex flex-cols-2 gap-8">
                        {/* Option 1: QR Code */}
                        <button 
                            disabled
                            onClick={() => setPaymentMethod('qr')}
                            className={`flex-1 group relative p-3 border-2 rounded-xl transition-all duration-300 shadow-sm
                                ${paymentMethod === 'qr' 
                                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-opacity-10 cursor-pointer" 
                                    : "border-gray-200 bg-white hover:border-indigo-300"} cursor-pointer`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 mb-3 rounded-full flex items-center justify-center transition-colors">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                </div>
                                <span className="text-base font-semibold text-gray-700 group-hover:text-indigo-700">QR Code</span>
                            </div>
                        </button>

                        {/* Option 2: Bank Account */}
                        <button 
                            onClick={() => setPaymentMethod('bank')}
                            className={`flex-1 group relative p-3 border-2 rounded-xl transition-all duration-300 shadow-sm
                                ${paymentMethod === 'bank' 
                                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-opacity-10 cursor-pointer" 
                                    : "border-gray-200 bg-white hover:border-indigo-300"} cursor-pointer`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 mb-3 rounded-full flex items-center justify-center transition-colors">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span className="text-base font-semibold text-gray-700 group-hover:text-indigo-700">โอนเงินธนาคาร</span>
                            </div>
                        </button>
                    </div>

                    <div className="mt-3 mb-3 text-center md:text-left">
                        <h2 className="text-xl font-bold text-gray-800">ร่วมบริจาคเงิน (บาท)</h2>
                    </div>

                    <div className="flex flex-1 justify-between gap-4 mb-6">
                        {[100, 500, 1000].map((amount) => (
                            <button 
                                key={amount}
                                onClick={() => setDonateAmount(amount)}
                                className={`flex-1 p-4 border-2 rounded-xl font-bold transition-all cursor-pointer
                                    ${donateAmount === amount 
                                    ? "border-indigo-800 bg-indigo-800 text-white shadow-md" 
                                    : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"}`}
                            >
                                {amount.toLocaleString()} ฿
                            </button>
                        ))}
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 mb-2">ระบุจำนวนเงินเอง</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="ระบุยอดเงินที่คุณต้องการ"
                                value={donateAmount || ''}
                                onChange={(e) => setDonateAmount(Number(e.target.value))}
                                className="w-full p-3 pl-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-indigo-800 focus:outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                        </div>
                    </div>

                    <button 
                        disabled={!paymentMethod || !donateAmount}
                        onClick={() => setStep(2)}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                            ${(paymentMethod && donateAmount) 
                            ? "bg-indigo-800 text-white hover:bg-indigo-900 shadow-lg cursor-pointer" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    >
                        ยืนยันการบริจาค
                    </button>
                </div>
            )}

            {/* Step 2 Form */}
            {step === 2 && (
                <div className='ml-6'>
                    <div className="mb-3 text-center md:text-left">
                        <h2 className="text-xl font-bold text-gray-800">ความประสงค์</h2>
                    </div>

                    <div className='flex flex-cols-2 gap-8'>
                        <button
                            onClick={() => setReceipt(true)}
                            className={`flex-1 group relative p-2 border rounded-xl font-bold transition-all cursor-pointer
                                ${receipt === true
                                    ? 'border-indigo-800 bg-indigo-800 text-white shadow-md'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}
                        >
                            รับใบเสร็จ
                        </button>

                        <button
                            onClick={() => setReceipt(false)}
                            className={`flex-1 group relative p-2 border rounded-xl font-bold transition-all cursor-pointer
                                ${receipt === false
                                    ? 'border-indigo-800 bg-indigo-800 text-white shadow-md'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}
                        >
                            ไม่รับใบเสร็จ
                        </button>
                    </div>

                    <div className="my-3">
                        <h2 className="text-xl font-bold text-gray-800">ข้อมูลใบเสร็จรับเงิน</h2>
                    </div>

                    <div className="flex flex-cols-2 gap-8">
                        <button
                            onClick={() => setDonationType('บุคคลธรรมดา')}
                            className={`flex-1 group relative p-2 border rounded-xl font-bold transition-all cursor-pointer
                            ${donationType === 'บุคคลธรรมดา'
                                ? 'border-indigo-800 bg-indigo-800 text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}
                        >
                            บุคคลธรรมดา
                        </button>

                        <button
                            onClick={() => setDonationType('นิติบุคคล')}
                            className={`flex-1 group relative p-2 border rounded-xl font-bold transition-all cursor-pointer
                            ${donationType === 'นิติบุคคล'
                                ? 'border-indigo-800 bg-indigo-800 text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}
                        >
                            นิติบุคคล
                        </button>
                    </div>

                    <div className="flex flex-cols-2 mt-2 gap-8">
                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">คำนำหน้า <span className='text-red-500 font-bold'>*</span></label>
                            <select
                                className='border rounded-lg p-2 w-full bg-white'
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                                required
                            >
                                <option value="" disabled hidden>กรุณาเลือกคำนำหน้า</option>
                                <option value="นาย">นาย</option>
                                <option value="นางสาว">นางสาว</option>
                                <option value="นาง">นาง</option>
                            </select>
                        </div>

                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">ชื่อ - นามสกุล <span className='text-red-500 font-bold'>*</span></label>
                            <input 
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder='กรุณากรอกชื่อและนามสกุล'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>
                    </div>

                    <div className='flex flex-cols-2 mt-2 gap-8'>
                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">เบอร์โทรศัพท์ <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder='กรุณากรอกเบอร์โทรศัพท์'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-md font-semibold mb-1">เลขประจำตัวผู้เสียภาษี/เลขประจำตัวประชาชน <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                placeholder='กรุณากรอกเลขประจำตัวผู้เสียภาษี/เลขประจำตัวประชาชน'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-cols-3 mt-2 gap-2">
                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">บ้านเลขที่ <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={houseNumber}
                                onChange={(e) => setHouseNumber(e.target.value)}
                                placeholder='กรุณากรอกบ้านเลขที่'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>

                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">ที่อยู่ (หมู่/หมู่บ้าน/ถนน/ซอย) <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder='กรุณากรอกที่อยู่'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>

                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">แขวง/ตำบล <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={subDistrict}
                                onChange={(e) => setSubDistrict(e.target.value)}
                                placeholder='กรุณากรอกแขวง/ตำบล'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-cols-3 mt-2 gap-2">
                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">เขต/อำเภอ <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                placeholder='กรุณากรอกเขต/อำเภอ'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>

                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">จังหวัด <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                placeholder='กรุณากรอกจังหวัด'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>

                        <div className='flex-1'>
                            <label className="block text-md font-semibold mb-1">รหัสไปรษณีย์ <span className='text-red-500 font-bold'>*</span></label>
                            <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder='กรุณากรอกรหัสไปรษณีย์'
                                className='flex-1 border rounded-lg w-full p-2 bg-white'
                                required
                            />
                        </div>
                    </div>

                    <div className='my-2'>
                        <label className="block text-md font-semibold mb-1">อีเมล <span className='text-red-500 font-bold'>*</span></label>
                        <input
                            type="email"
                            value={donationEmail}
                            onChange={(e) => setDonationEmail(e.target.value)}
                            placeholder='กรุณากรอกอีเมล'
                            className='flex-1 border rounded-lg w-full p-2 bg-white'
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-md font-semibold mb-1">หมายเหตุ</label>
                        <textarea
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder='ระบุไม่เกิน 200 ตัวอักษร'
                            maxLength={200}
                            className="border rounded-lg w-full p-2 h-24 bg-white"
                        ></textarea>
                    </div>
                    
                    <div className='my-4'>
                        <button 
                            disabled={!donationType || !prefix || !fullName || !phoneNumber || !taxId || !houseNumber || !address || !subDistrict || !district || !province || !postalCode || !donationEmail }
                            onClick={() => setStep(3)}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                                ${(donationType && prefix && fullName && phoneNumber && taxId && houseNumber && address && subDistrict && district && province && postalCode && donationEmail) 
                                ? "bg-indigo-800 text-white hover:bg-indigo-900 shadow-lg cursor-pointer" 
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        >
                            ดำเนินการต่อ
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 Form */}
            {step === 3 && (
                <div className='ml-6'>
                    <div className="grid grid-cols-2 gap-4">
                        <div className='bg-white p-3 rounded-xl'>
                            <div className="flex-1 justify-center bg-indigo-900 w-full p-3 mb-5 rounded-xl">
                                <p className='text-white text-xl font-bold text-center'>บริจาคผ่านบัญชีธนาคาร</p>
                            </div>

                            <div className='flex justify-center items-center bg-sky-500 w-full p-5 mb-3 rounded-xl'>
                                <img src="/images/ktb-logo.png" alt="ktb-logo" />
                            </div>

                            <div className='my-2 p-2 border-b border-gray-300'>
                                <label className='text-lg font-bold'>ธนาคารกรุงไทย</label>
                            </div>

                            <div className='flex p-2 my-2 justify-between'>
                                <div>
                                    <label className='text-lg'>ชื่อบัญชี</label>
                                </div>
                                <div>
                                    <label className='text-lg'>มหาวิทยาลัยบูรพา</label>
                                </div>
                            </div>

                            <div className='flex p-2 my-2 justify-between'>
                                <div>
                                    <label className='text-lg'>เลขบัญชี</label>
                                </div>
                                <div>
                                    <label className='text-lg'>3861004429</label>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white p-3 rounded-xl'>
                            <div className='p-2 mb-4'>
                                <h2 className='text-xl font-bold'>รายละเอียดการบริจาค</h2>
                            </div>

                            <div className='flex p-2 justify-between'>
                                <div>
                                    <label className='text-lg'>เลขที่ใบเสร็จ</label>
                                </div>

                                <div>
                                    <label className='text-lg'>{receiptNo || 'จะออกหลังจากยืนยันการบริจาค'}</label>
                                </div>
                            </div>

                            <div className='flex p-2 justify-between'>
                                <div>
                                    <label className='text-lg'>วันที่</label>
                                </div>

                                <div>
                                    <label className='text-lg'>{today || 'กำลังโหลด...'}</label>
                                </div>
                            </div>

                            <div className='flex p-2 justify-between'>
                                <div>
                                    <label className='text-lg'>ชื่อผู้บริจาค</label>
                                </div>

                                <div>
                                    <label className='text-lg'>{prefix + ' ' + fullName}</label>
                                </div>
                            </div>

                            <div className='flex p-2 justify-between'>
                                <div>
                                    <div>
                                        <label className='text-lg'>เลขประจำตัวผู้เสียภาษี/</label>
                                    </div>
                                    <label className='text-lg'>เลขประจำตัวประชาชน</label>
                                </div>

                                <div>
                                    <label className='text-lg'>{taxId}</label>
                                </div>
                            </div>

                            <div className='flex p-2 justify-between'>
                                <div className='overflow'>
                                    <label className='text-lg'>จำนวนเงิน</label>
                                </div>

                                <div>
                                    <label className='text-lg'>{donateAmount} บาท</label>
                                </div>
                            </div>

                            <div className='flex p-2 justify-between'>
                                <div>
                                    <label className='text-lg'>โครงการ</label>
                                </div>

                                <div>
                                    <label className='text-lg'>{project.acf.project_name}</label>
                                </div>
                            </div>

                            <div className='flex p-2 justify-between border-b border-gray-300'>
                                <div>
                                    <label className='text-lg'>องค์กร</label>
                                </div>

                                <div>
                                    <label className='text-lg'>มหาวิทยาลัยบูรพา</label>
                                </div>
                            </div>

                            <div className='p-2 mb-4'>
                                <h2 className='text-xl font-bold'>แนบหลักฐานการโอนเงิน <span className='text-red-500 font-bold'>*</span></h2>
                            </div>
                            
                            <div>
                                <input
                                    type="file"
                                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={(e) => setDonationReceipt(e.target.files ? e.target.files[0] : null)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            disabled={!donationReceipt}
                            onClick={handleSubmitDonation}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                                ${donationReceipt 
                                    ? "bg-indigo-800 text-white hover:bg-indigo-900 shadow-lg cursor-pointer"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        >
                            ยืนยันการบริจาค
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl">
                    <h1 className="text-2xl font-bold text-green-600">
                        บริจาคสำเร็จ 🎉
                    </h1>

                    <p className="mt-4 text-gray-600">
                        เลขที่ใบเสร็จของคุณ
                    </p>

                    <p className="text-xl font-bold mt-2">
                        {receiptNo}
                    </p>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 bg-indigo-800 text-white px-6 py-3 rounded-xl cursor-pointer"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}