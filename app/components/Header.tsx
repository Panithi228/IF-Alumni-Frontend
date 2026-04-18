'use client';
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("jwtToken");
    setToken(null);
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const checkToken = () => {
    const storedToken = window.localStorage.getItem("jwtToken");
    setToken(storedToken);
  };

  useEffect(() => {
    checkToken();
    
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, [pathname]);
  
  return (
    <header style={{ width: '100%' }}>
      <div style={{
        background: '#0a1628',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        borderBottom: '0.5px solid #1e3a5f',
        fontFamily: 'sans-serif',
        width: '100%',
      }}>
        {/* Circuit SVG Background */}
        <svg
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}
          viewBox="0 0 900 72"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="18" x2="200" y2="18" stroke="#1e3a5f" strokeWidth="0.5"/>
          <line x1="200" y1="18" x2="220" y2="36" stroke="#1e3a5f" strokeWidth="0.5"/>
          <line x1="220" y1="36" x2="900" y2="36" stroke="#1e3a5f" strokeWidth="0.5"/>
          <circle cx="200" cy="18" r="2.5" fill="#1e4d8c"/>
          <circle cx="220" cy="36" r="2.5" fill="#1e4d8c"/>
          <line x1="0" y1="54" x2="120" y2="54" stroke="#1e3a5f" strokeWidth="0.5"/>
          <line x1="120" y1="54" x2="140" y2="36" stroke="#1e3a5f" strokeWidth="0.5"/>
          <circle cx="120" cy="54" r="2" fill="#1e4d8c"/>
          <line x1="600" y1="12" x2="750" y2="12" stroke="#1e3a5f" strokeWidth="0.5"/>
          <line x1="750" y1="12" x2="770" y2="30" stroke="#1e3a5f" strokeWidth="0.5"/>
          <circle cx="750" cy="12" r="2" fill="#1e4d8c"/>
          <circle cx="770" cy="30" r="2" fill="#1e4d8c"/>
          <line x1="770" y1="30" x2="900" y2="30" stroke="#1e3a5f" strokeWidth="0.5"/>
          <line x1="850" y1="60" x2="900" y2="60" stroke="#1e3a5f" strokeWidth="0.5"/>
          <circle cx="850" cy="60" r="2" fill="#1e4d8c"/>
          <line x1="850" y1="60" x2="840" y2="48" stroke="#1e3a5f" strokeWidth="0.5"/>
          <rect x="330" y="6" width="6" height="6" rx="1" fill="none" stroke="#1e3a5f" strokeWidth="0.5"/>
          <rect x="490" y="18" width="6" height="6" rx="1" fill="none" stroke="#1e3a5f" strokeWidth="0.5"/>
          <rect x="410" y="57" width="6" height="6" rx="1" fill="none" stroke="#1e3a5f" strokeWidth="0.5"/>
          <line x1="0" y1="36" x2="900" y2="36" stroke="#132238" strokeWidth="0.5" strokeDasharray="2 6"/>
        </svg>

        {/* Banner Content */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6">
          {/* Logo Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a3a6e 0%, #0d2244 100%)',
              border: '1.5px solid #3b82c4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <img
                src="https://www.informatics.buu.ac.th/2020/wp-content/uploads/2018/04/logo-informatics.png"
                alt="Informatics BUU Logo"
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '17px',
                fontWeight: 500,
                background: 'linear-gradient(90deg, #60a5fa 0%, #93c5fd 60%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
                lineHeight: 1.2,
              }}>
                IF-Alumni
              </span>

              <span style={{
                fontSize: '10px',
                color: '#4a7ab5',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}>
                Burapha University A Informatics
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link
              href={"/"}
              className={`text-sm px-1.5 py-1.5 rounded-md border transition
                ${
                  isActive("/")
                    ? "text-blue-400 border-blue-400/40 bg-blue-400/10"
                    : "text-slate-400 border-transparent hover:bg-slate-700/30"
                }`}
            >
              Home
            </Link>

            <Link 
              href={"/donation"}
              className={`text-sm px-1.5 py-1.5 rounded-md border transition
                ${
                  isActive("/donation")
                    ? "text-blue-400 border-blue-400/40 bg-blue-400/10"
                    : "text-slate-400 border-transparent hover:bg-slate-700/30"
                }`}
            >
              Donation
            </Link>

            {token && (
              <Link 
                href={"/summary"}
                className={`text-sm px-1.5 py-1.5 rounded-md border transition
                  ${
                    isActive("/summary")
                      ? "text-blue-400 border-blue-400/40 bg-blue-400/10"
                      : "text-slate-400 border-transparent hover:bg-slate-700/30"
                  }`}
              >
                Donation Summary
              </Link>
            )}
            
            {token ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium transition cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-blue-700 hover:bg-blue-900 px-4 py-2 rounded-lg text-white font-medium transition cursor-pointer"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}