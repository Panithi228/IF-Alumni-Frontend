
'use client'
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import AddDonationModal from "./Modal/addDonationModal";

export default function Donation() {
  const [token, setToken] = useState<string | null>(null);
  const [addDonationModalOpen, setAddDonationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectLists, setProjectLists] = useState<any>([]);
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const DEFAULT_IMAGE = `http://localhost:8041/wp-content/uploads/2026/04/user-icon-fake-photo-sign-profile-button-simple-style-social-media-poster-background-symbol-user-brand-logo-design-element-user-t-shirt-printing-for-sticker-free-vector.jpg`;

  const openAddDonationModal = () => setAddDonationModalOpen(!addDonationModalOpen);

  const getFeaturedImageUrl = (project: any) => {
      if (project._embedded && project._embedded['wp:featuredmedia']) {
          return project._embedded['wp:featuredmedia'][0]?.source_url;
      }
      return DEFAULT_IMAGE;
  }

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
          Swal.fire({
              title: 'กำลังดำเนินการ...',
              allowOutsideClick: false,
              didOpen: () => {
                  Swal.showLoading(); 
              }
          });

          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/project/${id}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken')
                  },
                  body: JSON.stringify({ status: 'draft' })
              });

              if (response.ok) {
                  await Swal.fire({
                      icon: 'success',
                      title: 'ซ่อนเรียบร้อย!',
                      showConfirmButton: false,
                      timer: 1500
                  });
                  fetchProject();
              } else {
                  throw new Error('Server response was not ok');
              }
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
          Swal.fire({
              title: 'กำลังดำเนินการ...',
              allowOutsideClick: false,
              didOpen: () => {
                  Swal.showLoading(); 
              }
          });

          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/project/${id}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + window.localStorage.getItem('jwtToken')
                  },
                  body: JSON.stringify({ status: 'publish' })
              });

              if (response.ok) {
                  await Swal.fire({
                      icon: 'success',
                      title: 'เผยแพร่เรียบร้อย!',
                      showConfirmButton: false,
                      timer: 1500
                  });
                  fetchProject();
              } else {
                  throw new Error('Server response was not ok');
              }
          } catch (error) {
              Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถแสดงได้ในขณะนี้', 'error');
          }
      }
  };

  const fetchProject = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const activeToken = token || window.localStorage.getItem('jwtToken');

    try {
      const url = activeToken
        ? `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/project?status=publish,pending,draft&per_page=9&page=${pageNum}&_embed`
        : `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/project?status=publish&per_page=9&page=${pageNum}&_embed`;

      const response = await fetch(url, {
        headers: activeToken
          ? { Authorization: 'Bearer ' + activeToken }
          : {}
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const totalPages = Number(response.headers.get('X-WP-TotalPages'));
      const data = await response.json();

      setProjectLists((prev: any) =>
        reset || pageNum === 1 ? data : [...prev, ...data]
      );

      setHasMore(pageNum < totalPages);
      setPage(pageNum);

    } catch (error) {
      console.error('Error:', error);
      if (pageNum === 1) setProjectLists([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  useEffect(() => {
      const checkToken = () => {
        const storedToken = window.localStorage.getItem("jwtToken");
        setToken(storedToken);
      };
  
      checkToken();
      
      window.addEventListener('storage', checkToken);
      return () => window.removeEventListener('storage', checkToken);
    }, []);
  
    useEffect(() => {
      const checkToken = () => {
        const storedToken = window.localStorage.getItem("jwtToken");
        setToken(storedToken);
      };
  
      checkToken();
      window.addEventListener('storage', checkToken);
      return () => window.removeEventListener('storage', checkToken);
    }, [pathname]);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center mb-8 pb-4 border-b border-gray-100">
          <div className="flex-1 items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-gray-800">ร่วมบริจาค</h1>
            <p className="text-lg text-gray-400">ร่วมบริจาคเพื่อส่งเสริมให้นิสิตคณะวิทยาการสารสนเทศได้ทำกิจกรรมอย่างมีประสิทธิภาพ</p>
          </div>
        </div>
        <div className="flex-1 gap-4">
          <div className="flex justify-end p-2">
            {/* ปุ่มเพิ่ม โครงการ */}
            {token && (
              <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  onClick={openAddDonationModal}
              >
                  <span className="text-xl">+</span> เพิ่มโครงการ
              </button>
            )}
          </div>
          <div>
            {loading ? (
                <div className="flex justify-center my-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ): (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectLists.length > 0 ? projectLists.map((project: any) => (
                  <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                    <div className="h-56 bg-gray-200 overflow-hidden relative">
                        <img 
                            src={getFeaturedImageUrl(project)} 
                            alt={project.title.rendered}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Banner Container */}
                        {project.acf.tax_deduction > 1 && (
                          <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none z-10">
                              <div className="bg-red-700 text-white text-[14px] font-extrabold py-1.5 w-[160%] absolute top-[12px] -right-[68px] rotate-40 shadow-lg flex flex-col items-center justify-center uppercase tracking-tighter border-y border-white/20">
                                  <span className="leading-tight">ลดหย่อนภาษี</span>
                                  <span className="text-[16px] -mt-0.5">{project.acf.tax_deduction} เท่า</span>
                              </div>
                          </div>
                        )}
                    </div>

                    <Link href={`/donation/${project.id}`}>
                      <div className="p-5 h-30">
                          <h3 className="line-clamp-1 text-xl font-bold text-gray-800 mb-1 hover:text-indigo-600 transition-colors" 
                              dangerouslySetInnerHTML={{ __html: project.title.rendered }}>
                          </h3>

                        <h4 className="line-clamp-3 text-gray-600">
                          {project.acf.project_info}
                        </h4>
                      </div>
                    </Link>

                    <div className="flex gap-2 p-2 items-baseline">
                      {token &&(
                            <button 
                              onClick={() => handleShow(project.id)}
                              disabled={project.status === 'publish'}
                              className={`flex-1 text-md font-semibold py-3 px-10 rounded-lg border transition
                              ${project.status === 'publish'
                                  ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                  : 'bg-green-100 hover:bg-green-200 text-green-700 border-green-400 cursor-pointer'
                              }`}
                          >
                              Show
                          </button>
                      )}

                      {token && (
                        <button 
                        onClick={() => handleHide(project.id)}
                        disabled={project.status === 'draft'}
                        className={`flex-1 text-md font-semibold py-3 px-10 rounded-lg border transition
                            ${project.status === 'draft'
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                : 'bg-red-100 hover:bg-red-200 text-red-700 border-red-400 cursor-pointer'
                            }`}
                        >
                            Hide
                        </button>
                      )}
                    </div>
                  </div>
                )): (
                  <div className="col-span-full text-center py-10 text-gray-500">
                      ไม่มีโครงการเปิดให้บริจาคในขณะนี้
                  </div>
                )}

                {hasMore && (
                  <div className="col-span-full flex justify-center mt-6">
                      <button
                          onClick={() => fetchProject(page + 1)}
                          disabled={loadingMore}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all disabled:bg-gray-300 cursor-pointer"
                      >
                          {loadingMore ? (
                              <span className="flex items-center gap-2">
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  กำลังโหลด...
                              </span>
                          ) : 'โหลดเพิ่มเติม'}
                      </button>
                  </div>
              )}
              </div>
            )}
          </div>
          {addDonationModalOpen && (
            <AddDonationModal
              handleCloseEvent={openAddDonationModal}
              fetchDataEvent={fetchProject}
            />
          )}
        </div>
      </div>
    </div>
  );
}