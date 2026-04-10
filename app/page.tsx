'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostLists from "./components/post/postLists";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setToken(window.localStorage.getItem("jwtToken"));
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("jwtToken");
    setToken(null);
    router.refresh();
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
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

      <PostLists token={token} />
    </div>
  );
}