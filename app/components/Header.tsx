'use client';
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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
    <header>
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <Link href={"/"}>
            <h1 className="text-2xl font-bold">IF-Alumni</h1>
          </Link>

          <div className="flex items-center gap-5">
            <Link href={"/donation"}>
              <h1 className="text-md font-medium">Donation</h1>
            </Link>

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
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-white font-medium transition cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}