import React from 'react';
import { HomeNavbar } from '../HomeNavbar';
import { HeroButtonsSection } from '../HeroButtonsSection';

export const HomePage = () => {
  return (
    <div className="bg-light-beige">
      <div className="min-h-screen max-w-screen-xl mx-auto">
        <HomeNavbar />
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20">
          <div className="md:w-1/2 space-y-8">
            <HeroButtonsSection />
          </div>
          <div className="md:w-1/2">
            <img
              src="../../assets/lgbt-pride.svg"
              alt="Imagem representativa"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
