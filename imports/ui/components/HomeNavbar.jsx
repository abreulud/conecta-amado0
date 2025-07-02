import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { NavLinks } from './NavLinks';
import { LogoSection } from './LogoSection';
import { NavAuthButtons } from './NavAuthButtons';

export const HomeNavbar = () => {
  const user = useTracker(() => Meteor.user());
  const navigate = useNavigate();

  const handleLogout = () => {
    Meteor.logout();
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center p-6">
      <LogoSection />
      <NavLinks />
      <NavAuthButtons user={user} onLogout={handleLogout} />
    </nav>
  );
};
