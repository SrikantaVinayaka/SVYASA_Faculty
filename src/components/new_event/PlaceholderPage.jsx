import React from 'react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.replace('/', '').replace('-', ' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: '#f9e8ea' }}>
        <span className="text-4xl">🚧</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 capitalize mb-2">{pageName || 'Page'}</h1>
      <p className="text-gray-500 text-sm">This page is under construction. You can build it and integrate it here!</p>
    </div>
  );
};

export default PlaceholderPage;
