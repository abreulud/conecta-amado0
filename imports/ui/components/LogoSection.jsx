import React from 'react';
import { Link } from 'react-router-dom';

export const LogoSection = () => {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="../../assets/amadoLogo.svg"
        alt="AMADO"
        className="h-8 w-auto"
      />
    </Link>
  );
};
