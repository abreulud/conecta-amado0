import React from 'react';
import { Link } from 'react-router-dom';

export const NavAuthButtons = ({ user, onLogout }) => {
  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-[#f54e6e] font-semibold text-sm">
          Olá, {user.username || user.profile?.name || 'Usuário'}
        </span>
        <button
          onClick={onLogout}
          className="bg-[#f54e6e] text-white px-4 py-2 rounded-full text-sm hover:bg-[#e0445f]"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="space-x-4">
      <Link
        to="/signup"
        className="border border-[#f54e6e] text-[#f54e6e] px-4 py-2 rounded-full hover:bg-[#f54e6e]/10 text-sm"
      >
        Registrar-se
      </Link>
      <Link
        to="/login"
        className="bg-[#f54e6e] text-white px-4 py-2 rounded-full text-sm hover:bg-[#e0445f]"
      >
        Login
      </Link>
    </div>
  );
};
