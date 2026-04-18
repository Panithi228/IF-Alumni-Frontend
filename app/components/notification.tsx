'use client';
import Link from "next/link";

type Alumni = {
    id: number;
    title: { rendered: string };
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    drafts: Alumni[];
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
};

const Notification = ({ isOpen, onClose, drafts, onApprove, onReject }: Props) => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('jwtToken') : null;
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between bg-amber-50 px-6 py-4 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-amber-800">Pending Approval</h2>
                        <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {drafts.length}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-amber-800 hover:bg-amber-200 p-1 rounded-full transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] overflow-y-auto p-4">
                    {drafts.length > 0 ? (
                        <div className="space-y-3">
                            {drafts.map((alumni) => (
                                <div key={alumni.id} className="flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-amber-50/50 transition-colors">
                                    <Link href={`/about/${alumni.id}`} className="text-sm text-gray-500 hover:underline">
                                        <span className="font-semibold text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: alumni.title.rendered }}></span>
                                    </Link>
                                    <div className="flex justify-end items-center gap-5">
                                        {/* <span className="text-xs text-gray-400">ID: #{alumni.id}</span> */}
                                        {onReject && (
                                            <button
                                                onClick={() => onReject(alumni.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-shadow shadow-sm cursor-pointer"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        
                                        {onApprove && (
                                            <button
                                                onClick={() => onApprove(alumni.id)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-shadow shadow-sm cursor-pointer"
                                            >
                                                Approve Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No pending alumni to approve ✨</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notification;