'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function DonationDetailModal({
    donation,
    projectMap,
    onClose,
}: {
    donation: any;
    projectMap: Record<string, string>;
    onClose: () => void;
}) {
    const acf = donation.acf || {};
    const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

    const row = (label: string, value: React.ReactNode) => (
        <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0 gap-4">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-800 text-right">{value || '-'}</span>
        </div>
    );

    useEffect(() => {
        const receiptId = donation.acf?.donation_receipt;
        if (!receiptId) return;

        fetch(`http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2/media/${receiptId}`, {
            headers: { Authorization: 'Bearer ' + window.localStorage.getItem('jwtToken') }
        })
            .then(res => res.json())
            .then(data => setReceiptImageUrl(data.source_url ?? null))
            .catch(() => setReceiptImageUrl(null));
    }, [donation.acf?.donation_receipt]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">รายละเอียดการบริจาค</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{acf.receipt_no || 'ยังไม่มีเลขที่ใบเสร็จ'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-lg"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 py-4 space-y-1">
                    <p className="text-xs font-semibold text-[#1A3A6B] uppercase tracking-wider mb-2">ข้อมูลการบริจาค</p>
                    {row('เลขที่ใบเสร็จ', acf.receipt_no)}
                    {row('วันที่บริจาค', new Date(donation.date).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    }))}
                    {row('ต้องการใบเสร็จ', (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            acf.receipt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                            {acf.receipt ? 'ต้องการ' : 'ไม่ต้องการ'}
                        </span>
                    ))}
                    {row('โครงการ', projectMap[acf.project_id] || acf.project_id)}
                    {row('จำนวนเงิน', (
                        <span className="text-blue-700 font-bold text-base">
                            ฿{Number(acf.donation_amount || 0).toLocaleString()}
                        </span>
                    ))}
                    {row('วิธีชำระเงิน', acf.payment_method)}

                    <p className="text-xs font-semibold text-[#1A3A6B] uppercase tracking-wider pt-4 mb-2">ข้อมูลผู้บริจาค</p>
                    {row('ประเภท', acf.donation_type)}
                    {row('ชื่อ-นามสกุล', `${acf.prefix || ''} ${acf.full_name || ''}`.trim())}
                    {row('เลขบัตรประชาชน', acf.id)}
                    {row('เบอร์โทรศัพท์', acf.phone_number)}
                    {row('อีเมล', acf.donation_email)}

                    <p className="text-xs font-semibold text-[#1A3A6B] uppercase tracking-wider pt-4 mb-2">ที่อยู่</p>
                    {row('บ้านเลขที่', acf.house_number)}
                    {row('ที่อยู่', acf.address)}
                    {row('ตำบล/แขวง', acf.sub_district)}
                    {row('อำเภอ/เขต', acf.district)}
                    {row('จังหวัด', acf.province)}
                    {row('รหัสไปรษณีย์', acf.postal_code)}

                    {acf.additional_info && (
                        <>
                            <p className="text-xs font-semibold text-[#1A3A6B] uppercase tracking-wider pt-4 mb-2">ข้อมูลเพิ่มเติม</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{acf.additional_info}</p>
                        </>
                    )}

                    <p className="text-xs font-semibold text-[#1A3A6B] uppercase tracking-wider pt-4 mb-3">หลักฐานการโอนเงิน</p>
                    {receiptImageUrl ? (
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                            <img
                                src={receiptImageUrl}
                                alt="หลักฐานการโอนเงิน"
                                className="w-full object-contain max-h-72"
                            />
                            <div className="flex justify-end px-3 py-2 bg-gray-50 border-t border-gray-100">
                                <a
                                    href={receiptImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    เปิดในแท็บใหม่
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-400">
                            ไม่มีหลักฐานการโอนเงิน
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-[#1A3A6B] text-white hover:bg-[#15305a] transition-colors cursor-pointer"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── หน้าหลัก ──────────────────────────────────────────────────────────────
export default function SummaryPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
    const [selectedYear, setSelectedYear] = useState('');
    const PER_PAGE = 10;

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2/project?per_page=100&status=any&_embed', {
                    headers: { Authorization: 'Bearer ' + window.localStorage.getItem('jwtToken') }
                });

                const data = await res.json();
                setProjects(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchProjects();
    }, []);

    const fetchDonations = async (page = 1) => {
        setLoading(true);
        try {
            const url = `http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2/donation?per_page=${PER_PAGE}&page=${page}&_embed&orderby=date&order=desc`;
            const res = await fetch(url, {
                headers: { Authorization: 'Bearer ' + window.localStorage.getItem('jwtToken') }
            });
            const total = Number(res.headers.get('X-WP-TotalPages') || 1);
            const data = await res.json();
            setDonations(Array.isArray(data) ? data : []);
            setTotalPages(total);
            setCurrentPage(page);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredDonations = donations.filter(d => {
        const date = new Date(d.date);

        const matchProject = !selectedProject || String(d.acf?.project_id) === selectedProject;
        const matchMonth = !selectedMonth || new Date(d.date).getMonth() + 1 === Number(selectedMonth);
        const matchYear = !selectedYear || date.getFullYear() === Number(selectedYear);
        return matchProject && matchMonth && matchYear;
    });

    useEffect(() => {
        fetchDonations(1);
    }, [selectedProject, selectedMonth, selectedYear]);

    const totalAmount = filteredDonations.reduce((sum, d) => sum + Number(d.acf?.donation_amount || 0), 0);
    const uniqueDonors = new Set(filteredDonations.map(d => d.acf?.full_name)).size;
    const totalCount = filteredDonations.length;

    const chartData = MONTHS.map((m, i) => ({
        name: MONTHS_TH[i],
        amount: donations
            .filter(d => {
                const date = new Date(d.date);
                const matchYear = !selectedYear || date.getFullYear() === Number(selectedYear);
                return date.getMonth() === i && matchYear;
            })
            .reduce((sum, d) => sum + Number(d.acf?.donation_amount || 0), 0)
    }));

    const projectMap = projects.reduce((acc, p) => {
        acc[String(p.id)] = p.acf?.project_name || p.title?.rendered;
        return acc;
    }, {} as Record<string, string>);

    const handleExport = async () => {
        setExporting(true);
        try {
            // ดึงข้อมูลทุก page
            const allDonations: any[] = [];
            let page = 1;
            let total = 1;

            do {
                const url = `http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2/donation?per_page=100&page=${page}&_embed&orderby=date&order=desc`;
                const res = await fetch(url, {
                    headers: { Authorization: 'Bearer ' + window.localStorage.getItem('jwtToken') }
                });
                total = Number(res.headers.get('X-WP-TotalPages') || 1);
                const data = await res.json();
                if (Array.isArray(data)) allDonations.push(...data);
                page++;
            } while (page <= total);

            // กรองตาม filter ที่เลือก
            const exportData = allDonations.filter(d => {
                const date = new Date(d.date);
                
                const matchProject = !selectedProject || String(d.acf?.project_id) === selectedProject;
                const matchMonth = !selectedMonth || new Date(d.date).getMonth() + 1 === Number(selectedMonth);
                const matchYear = !selectedYear || date.getFullYear() === Number(selectedYear);
                return matchProject && matchMonth;
            });

            // ดึง source_url ของ receipt แต่ละรายการจาก media API
            const receiptUrls: Record<number, string> = {};
            await Promise.all(
                exportData.map(async (d) => {
                    const receiptId = d.acf?.donation_receipt;
                    if (!receiptId) return;
                    try {
                        const res = await fetch(
                            `http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2/media/${receiptId}`,
                            { headers: { Authorization: 'Bearer ' + window.localStorage.getItem('jwtToken') } }
                        );
                        const media = await res.json();
                        if (media.source_url) receiptUrls[d.id] = media.source_url;
                    } catch {}
                })
            );

            const rows = exportData.map((d, i) => {
                const acf = d.acf || {};
                return {
                    'ลำดับ':             i + 1,
                    'เลขที่ใบเสร็จ':      acf.receipt_no     || '-',
                    'วันที่บริจาค':        new Date(d.date).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                    'ต้องการใบเสร็จ':     acf.receipt ? 'ต้องการ' : 'ไม่ต้องการ',
                    'ประเภทผู้บริจาค':    acf.donation_type  || '-',
                    'คำนำหน้า':           acf.prefix         || '-',
                    'ชื่อ-นามสกุล':       acf.full_name      || '-',
                    'เลขบัตรประชาชน':     acf.id             || '-',
                    'เบอร์โทรศัพท์':      acf.phone_number   || '-',
                    'อีเมล':              acf.donation_email || '-',
                    'บ้านเลขที่':         acf.house_number   || '-',
                    'ที่อยู่':            acf.address        || '-',
                    'ตำบล/แขวง':         acf.sub_district   || '-',
                    'อำเภอ/เขต':         acf.district       || '-',
                    'จังหวัด':           acf.province       || '-',
                    'รหัสไปรษณีย์':      acf.postal_code    || '-',
                    'จำนวนเงิน (บาท)':   Number(acf.donation_amount || 0),
                    'โครงการ':           projectMap[acf.project_id] || acf.project_id || '-',
                    'วิธีชำระเงิน':       acf.payment_method || '-',
                    'ข้อมูลเพิ่มเติม':    acf.additional_info || '-',
                    'หลักฐานการโอนเงิน': receiptUrls[d.id] || '-',
                };
            });

            // Summary row — ต้องมีครบทุก key เหมือน rows ปกติ
            rows.push({
                'ลำดับ':             '' as any,
                'เลขที่ใบเสร็จ':      '',
                'วันที่บริจาค':        '',
                'ต้องการใบเสร็จ':     '',
                'ประเภทผู้บริจาค':    '',
                'คำนำหน้า':           '',
                'ชื่อ-นามสกุล':       'รวมทั้งหมด',
                'เลขบัตรประชาชน':     '',
                'เบอร์โทรศัพท์':      '',
                'อีเมล':              '',
                'บ้านเลขที่':         '',
                'ที่อยู่':            '',
                'ตำบล/แขวง':         '',
                'อำเภอ/เขต':         '',
                'จังหวัด':           '',
                'รหัสไปรษณีย์':      '',
                'จำนวนเงิน (บาท)':   exportData.reduce((sum, d) => sum + Number(d.acf?.donation_amount || 0), 0),
                'โครงการ':           '',
                'วิธีชำระเงิน':       '',
                'ข้อมูลเพิ่มเติม':    '',
                'หลักฐานการโอนเงิน': '',
            });

            const ws = XLSX.utils.json_to_sheet(rows);

            // ใส่ hyperlink ให้เซลล์ที่มี URL (เริ่มจาก row 2 เพราะ row 1 = header)
            exportData.forEach((d, i) => {
                const url = receiptUrls[d.id];
                if (!url) return;
                // column U = index 20 (0-based) = หลักฐานการโอนเงิน
                const cellRef = XLSX.utils.encode_cell({ r: i + 1, c: 20 });
                if (ws[cellRef]) {
                    ws[cellRef].l = { Target: url, Tooltip: 'เปิดหลักฐาน' };
                }
            });

            // ความกว้างคอลัมน์ (21 คอลัมน์)
            ws['!cols'] = [
                { wch: 8 },  // ลำดับ
                { wch: 22 }, // เลขที่ใบเสร็จ
                { wch: 14 }, // วันที่
                { wch: 16 }, // ต้องการใบเสร็จ
                { wch: 18 }, // ประเภท
                { wch: 10 }, // คำนำหน้า
                { wch: 24 }, // ชื่อ
                { wch: 18 }, // เลขบัตร
                { wch: 14 }, // โทร
                { wch: 28 }, // อีเมล
                { wch: 12 }, // บ้านเลขที่
                { wch: 16 }, // ที่อยู่
                { wch: 14 }, // ตำบล
                { wch: 14 }, // อำเภอ
                { wch: 14 }, // จังหวัด
                { wch: 14 }, // ไปรษณีย์
                { wch: 16 }, // จำนวนเงิน
                { wch: 28 }, // โครงการ
                { wch: 14 }, // วิธีชำระ
                { wch: 24 }, // ข้อมูลเพิ่มเติม
                { wch: 60 }, // หลักฐานการโอนเงิน
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'รายการบริจาค');

            const projectLabel = selectedProject ? `_${projectMap[selectedProject] || selectedProject}` : '';
            const monthLabel = selectedMonth ? `_${MONTHS_TH[Number(selectedMonth) - 1]}` : '';
            const yearLabel = selectedYear ? `_${Number(selectedYear) + 543}` : '';
            const filename = `donation_report${projectLabel}${monthLabel}${yearLabel}_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (e) {
            console.error('Export failed:', e);
            alert('เกิดข้อผิดพลาดในการ export');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] p-6 font-sans">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');
                * { font-family: 'IBM Plex Sans Thai', 'Sarabun', sans-serif; }
            `}</style>

            {selectedDonation && (
                <DonationDetailModal
                    donation={selectedDonation}
                    projectMap={projectMap}
                    onClose={() => setSelectedDonation(null)}
                />
            )}

            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <select
                    value={selectedProject}
                    onChange={e => { setSelectedProject(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[160px]"
                >
                    <option value="">เลือกโครงการ</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.acf?.project_name || p.title?.rendered}</option>
                    ))}
                </select>

                <select
                    value={selectedMonth}
                    onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[120px]"
                >
                    <option value="">เลือกเดือน</option>
                    {MONTHS_TH.map((m, i) => (
                        <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
                    ))}
                </select>

                <select
                    value={selectedYear}
                    onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[120px]"
                >
                    <option value="">เลือกปี</option>
                    {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                            <option key={year} value={year}>
                                {year + 543}
                            </option>
                        );
                    })}
                </select>

                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="ml-auto flex items-center gap-2 px-5 py-2 bg-[#1A3A6B] hover:bg-[#15305a] disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    {exporting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            กำลัง Export...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            Export Excel
                        </>
                    )}
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">ยอดบริจาคทั้งหมด</p>
                    <p className="text-3xl font-bold text-blue-700">฿{totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">จำนวนผู้บริจาค</p>
                    <p className="text-3xl font-bold text-blue-700">{uniqueDonors} <span className="text-lg font-normal text-gray-500">คน</span></p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">จำนวนครั้งที่บริจาค</p>
                    <p className="text-3xl font-bold text-blue-700">{totalCount} <span className="text-lg font-normal text-gray-500">ครั้ง</span></p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h2 className="text-base font-semibold text-gray-700 mb-4">กราฟการบริจาครายเดือน</h2>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: number) => [`฿${value.toLocaleString()}`, 'ยอดบริจาค']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="amount" fill="#0D47A1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-blue-900 text-white">
                                <th className="px-4 py-3 text-center font-semibold w-12">No.</th>
                                <th className="px-4 py-3 text-left font-semibold">วันที่</th>
                                <th className="px-4 py-3 text-left font-semibold">ผู้บริจาค</th>
                                <th className="px-4 py-3 text-right font-semibold">จำนวนเงิน</th>
                                <th className="px-4 py-3 text-left font-semibold">โครงการ</th>
                                <th className="px-4 py-3 text-center font-semibold">ใบเสร็จ</th>
                                <th className="px-4 py-3 text-center font-semibold">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDonations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">ไม่พบข้อมูลการบริจาค</td>
                                </tr>
                            ) : filteredDonations.map((d, i) => (
                                <tr key={d.id} className={`border-b border-gray-50 hover:bg-indigo-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                    <td className="px-4 py-3 text-center text-gray-500">{(currentPage - 1) * PER_PAGE + i + 1}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {new Date(d.date).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{d.acf?.full_name || '-'}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-blue-800">
                                        {Number(d.acf?.donation_amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {projectMap[d.acf?.project_id] || d.acf?.project_id || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{d.acf?.receipt_no || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setSelectedDonation(d)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
                        <button
                            onClick={() => fetchDonations(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            ‹
                        </button>
                        <span className="text-sm text-gray-500">{currentPage} / {totalPages}</span>
                        <button
                            onClick={() => fetchDonations(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}