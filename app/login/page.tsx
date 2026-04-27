'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) return;

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        Swal.fire('Login Success', '', 'success');
        router.push('/');
      } else {
        Swal.fire('Login Failed', data.message || 'Invalid credentials', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 border rounded mb-3"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors cursor-pointer disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

export default Login;