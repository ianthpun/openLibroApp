import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useThemeStore } from '../store/themeStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, ready, authenticated } = usePrivy();
  const { isDarkMode } = useThemeStore();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (ready && authenticated) {
      navigate('/');
    }
  }, [ready, authenticated, navigate]);
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <BookOpen className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          <h2 className={`mt-6 text-3xl font-extrabold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Welcome to OpenLibro
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your personal digital library
          </p>
        </div>
        
        <div className="mt-8">
          <button
            onClick={() => login()}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            Sign in with Privy
          </button>
          
          <div className={`mt-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Sign in with your email, wallet, or social accounts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;