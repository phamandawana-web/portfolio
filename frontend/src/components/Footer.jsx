import React from 'react';
import { profileData } from '../mockData';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-gray-300 mb-2">
            © {currentYear} {profileData.name}. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            {profileData.department}, {profileData.university}
          </p>
          <p className="text-gray-500 text-xs mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
