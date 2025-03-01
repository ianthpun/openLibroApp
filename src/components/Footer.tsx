import React from 'react';
import { useThemeStore } from '../store/themeStore';

const Footer: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  
  return (
    <div className={`py-3 px-4 text-center ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex justify-center items-center">
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center">
            <img src="/flow-logo.png" alt="Flow Logo" className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Built with Flow</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;