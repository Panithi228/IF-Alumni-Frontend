'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

export default function SummaryPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PER_PAGE = 10;

    // Fetch all projects for dropdown
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('http://dekdee2.informatics.buu.ac.th:8041/wp-json/wp/v2/project?per_page=100');
                const data = await res.json();
                setProjects(Array.isArray(data) ? data : []);
                console.log('Fetched projects:', data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchProjects();
    }, []);

    // Fetch donations
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
        const matchProject = !selectedProject || String(d.acf?.project_id) === selectedProject;
        const matchMonth = !selectedMonth || new Date(d.date).getMonth() + 1 === Number(selectedMonth);
        return matchProject && matchMonth;
    });

    useEffect(() => {
        fetchDonations(1);
    }, [selectedProject, selectedMonth]);

    // Stats
    const totalAmount = filteredDonations.reduce((sum, d) => sum + Number(d.acf?.donation_amount || 0), 0);
    const uniqueDonors = new Set(filteredDonations.map(d => d.acf?.full_name)).size;
    const totalCount = filteredDonations.length;

    // Chart data — group by month
    const chartData = MONTHS.map((m, i) => ({
        name: MONTHS_TH[i],
        amount: donations
            .filter(d => {
                const date = new Date(d.date);
                return date.getMonth() === i;
            })
            .reduce((sum, d) => sum + Number(d.acf?.donation_amount || 0), 0)
    }));

    const projectMap = projects.reduce((acc, p) => {
        acc[String(p.id)] = p.acf?.project_name || p.title?.rendered;
        return acc;
    }, {} as Record<string, string>);
    
    return (
        <div className="min-h-screen bg-[#f5f6fa] p-6 font-sans">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');
                * { font-family: 'IBM Plex Sans Thai', 'Sarabun', sans-serif; }
            `}</style>

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
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">ยอดบริจาคทั้งหมด</p>
                    <p className="text-3xl font-bold text-indigo-700">฿{totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">จำนวนผู้บริจาค</p>
                    <p className="text-3xl font-bold text-indigo-700">{uniqueDonors} <span className="text-lg font-normal text-gray-500">คน</span></p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">จำนวนครั้งที่บริจาค</p>
                    <p className="text-3xl font-bold text-indigo-700">{totalCount} <span className="text-lg font-normal text-gray-500">ครั้ง</span></p>
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
                        <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-indigo-700 text-white">
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
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
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
                                    <td className="px-4 py-3 text-right font-semibold text-indigo-700">
                                        {Number(d.acf?.donation_amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {projectMap[d.acf?.project_id] || d.acf?.project_id || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{d.acf?.receipt_no || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => alert(`Post ID: ${d.id}`)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors cursor-pointer"
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

                {/* Pagination */}
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