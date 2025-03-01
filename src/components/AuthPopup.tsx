import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useThemeStore } from '../store/themeStore';

interface AuthPopupProps {
  isOpen?: boolean;
  onClose: () => void;
  message?: string;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen = true, onClose, message = "Sign in to access this feature" }) => {
  const { login } = usePrivy();
  const { isDarkMode } = useThemeStore();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`w-full max-w-md rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
        <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-center`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Sign in required
          </h3>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            aria-label="Close"
          >
            <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        
        <div className="p-6 text-center">
          <BookOpen className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mb-4`} />
          
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                login();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Sign in
            </button>
            
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;