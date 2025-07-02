import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NavLinks = () => {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Início' },
    { to: '/services', label: 'Serviços' },
    //{ to: '/destaques', label: 'Destaques' },
  ];

  return (
    <div className="space-x-6 hidden md:flex">
      {links.map(({ to, label }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`text-[#f54e6e] font-medium ${
              isActive
                ? 'border-b-2 border-[#f54e6e]'
                : 'hover:border-b-2 hover:border-[#f54e6e]'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
};
