import React from 'react';
import { LogoSection } from '../LogoSection';

export const Navbar = ({ username = 'Usuário', avatarSrc = '/avatar.png' }) => {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-6">
      <LogoSection />
      {/* User Info */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          Olá, {username}!
        </span>
      </div>
    </nav>
  );
};
