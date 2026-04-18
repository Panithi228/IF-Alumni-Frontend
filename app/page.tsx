'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import PostLists from "./components/post/postLists";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("jwtToken");
    setToken(null);
  };

  return (
    <div className="p-6">
      <PostLists token={token} />
    </div>
  );
}