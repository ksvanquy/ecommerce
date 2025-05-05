'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function AuthLinks() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <span className="text-gray-700">Welcome, {user.name}</span>
          <button
            onClick={() => logout()}
            className="text-gray-700 hover:text-indigo-600"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-gray-700 hover:text-indigo-600"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-gray-700 hover:text-indigo-600"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
} 