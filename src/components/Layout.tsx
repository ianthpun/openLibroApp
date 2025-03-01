import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Award, Shield, User, LogOut, Menu, X, Coins, Vote } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { useEarnStore } from '../store/earnStore';
import Footer from './Footer';
import AuthPopup from './AuthPopup';
import ThemeToggle from './ThemeToggle';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: privyUser, login, logout: privyLogout } = usePrivy();
  const { logout } = useUserStore();
  const { isDarkMode } = useThemeStore();
  const { libroBalance, stakedLibro, openVoteBalance } = useEarnStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  const isBookPage = location.pathname.includes('/book/');
  
  const isActive = (path: string) => {
    return location.pathname === path 
      ? isDarkMode 
        ? 'bg-gray-700 text-white' 
        : 'bg-gray-100 text-gray-900'
      : isDarkMode 
        ? 'text-gray-300 hover:bg-gray-700' 
        : 'text-gray-700 hover:bg-gray-100';
  };
  
  const handleLogout = async () => {
    await privyLogout();
    await logout();
    navigate('/login');
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {/* Mobile Header - Only visible on mobile */}
        {!isBookPage && (
          <header className={`md:hidden fixed top-0 left-0 right-0 z-30 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
            <Link to="/" className="flex items-center">
              <BookOpen className={`h-6 w-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className="text-lg font-bold">OpenLibro</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button 
                onClick={toggleMobileMenu}
                className={`p-2 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </header>
        )}
        
        {/* Mobile Navigation Menu - Slides in from top */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={closeMobileMenu}
            ></div>
            
            {/* Menu */}
            <div className={`absolute top-0 left-0 right-0 max-h-screen overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="p-4 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
                  <BookOpen className={`h-6 w-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <span className="text-lg font-bold">OpenLibro</span>
                </Link>
                <button 
                  onClick={closeMobileMenu}
                  className={`p-2 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* User Balance - Only show if logged in */}
              {privyUser && (
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`flex items-center justify-between ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    <div className="flex items-center">
                      <Coins className="h-5 w-5 mr-2" />
                      <span className="font-medium">$LIBRO</span>
                    </div>
                    <span>{libroBalance.toLocaleString()}</span>
                  </div>
                  <div className={`mt-2 flex items-center justify-between ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      <span className="font-medium">$sLIBRO</span>
                    </div>
                    <span>{stakedLibro.toLocaleString()}</span>
                  </div>
                  <div className={`mt-2 flex items-center justify-between ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    <div className="flex items-center">
                      <Vote className="h-5 w-5 mr-2" />
                      <span className="font-medium">$OPENVOTE</span>
                    </div>
                    <span>{openVoteBalance.toLocaleString()}</span>
                  </div>
                </div>
              )}
              
              {/* Navigation Links */}
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <Link 
                      to="/" 
                      className={`flex items-center p-3 rounded-lg ${isActive('/')}`}
                      onClick={closeMobileMenu}
                    >
                      <BookOpen className="h-5 w-5 mr-3" />
                      <span>Library</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/search" 
                      className={`flex items-center p-3 rounded-lg ${isActive('/search')}`}
                      onClick={closeMobileMenu}
                    >
                      <Search className="h-5 w-5 mr-3" />
                      <span>Search</span>
                    </Link>
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/earn" 
                        className={`flex items-center p-3 rounded-lg ${isActive('/earn')}`}
                        onClick={closeMobileMenu}
                      >
                        <Award className="h-5 w-5 mr-3" />
                        <span>Earn</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          setShowAuthPopup(true);
                        }}
                        className={`flex items-center p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Award className="h-5 w-5 mr-3" />
                        <span>Earn</span>
                      </button>
                    )}
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/staking" 
                        className={`flex items-center p-3 rounded-lg ${isActive('/staking')}`}
                        onClick={closeMobileMenu}
                      >
                        <Coins className="h-5 w-5 mr-3" />
                        <span>Staking</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          setShowAuthPopup(true);
                        }}
                        className={`flex items-center p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Coins className="h-5 w-5 mr-3" />
                        <span>Staking</span>
                      </button>
                    )}
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/audit" 
                        className={`flex items-center p-3 rounded-lg ${isActive('/audit')}`}
                        onClick={closeMobileMenu}
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        <span>Audit</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          setShowAuthPopup(true);
                        }}
                        className={`flex items-center p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        <span>Audit</span>
                      </button>
                    )}
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/profile" 
                        className={`flex items-center p-3 rounded-lg ${isActive('/profile')}`}
                        onClick={closeMobileMenu}
                      >
                        <User className="h-5 w-5 mr-3" />
                        <span>Profile</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          login();
                        }}
                        className={`flex items-center p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <User className="h-5 w-5 mr-3" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </li>
                </ul>
              </nav>
              
              {/* Logout Button - Only show if logged in */}
              {privyUser && (
                <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button 
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className={`flex items-center p-3 rounded-lg w-full ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Only visible on desktop */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} hidden md:block md:relative z-30 w-64 md:w-72 h-full border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
                    <BookOpen className={`h-8 w-8 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span className="text-xl font-bold">OpenLibro</span>
                  </Link>
                </div>
              </div>
              
              {/* LIBRO Balance Display - Only show if logged in */}
              {privyUser && (
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`flex items-center justify-between ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    <div className="flex items-center">
                      <Coins className="h-5 w-5 mr-2" />
                      <span className="font-medium">$LIBRO</span>
                    </div>
                    <span>{libroBalance.toLocaleString()}</span>
                  </div>
                  <div className={`mt-2 flex items-center justify-between ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      <span className="font-medium">$sLIBRO</span>
                    </div>
                    <span>{stakedLibro.toLocaleString()}</span>
                  </div>
                  <div className={`mt-2 flex items-center justify-between ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    <div className="flex items-center">
                      <Vote className="h-5 w-5 mr-2" />
                      <span className="font-medium">$OPENVOTE</span>
                    </div>
                    <span>{openVoteBalance.toLocaleString()}</span>
                  </div>
                </div>
              )}
              
              <nav className="flex-1 overflow-y-auto py-4 mt-12 md:mt-0">
                <ul className="space-y-2 px-2">
                  <li>
                    <Link 
                      to="/" 
                      className={`flex items-center justify-start p-3 rounded-lg ${isActive('/')}`}
                      onClick={closeMobileMenu}
                    >
                      <BookOpen className="h-6 w-6 mr-3" />
                      <span>Library</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/search" 
                      className={`flex items-center justify-start p-3 rounded-lg ${isActive('/search')}`}
                      onClick={closeMobileMenu}
                    >
                      <Search className="h-6 w-6 mr-3" />
                      <span>Search</span>
                    </Link>
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/earn" 
                        className={`flex items-center justify-start p-3 rounded-lg ${isActive('/earn')}`}
                        onClick={closeMobileMenu}
                      >
                        <Award className="h-6 w-6 mr-3" />
                        <span>Earn</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          setShowAuthPopup(true);
                        }}
                        className={`flex items-center justify-start p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Award className="h-6 w-6 mr-3" />
                        <span>Earn</span>
                      </button>
                    )}
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/staking" 
                        className={`flex items-center justify-start p-3 rounded-lg ${isActive('/staking')}`}
                        onClick={closeMobileMenu}
                      >
                        <Coins className="h-6 w-6 mr-3" />
                        <span>Staking</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          setShowAuthPopup(true);
                        }}
                        className={`flex items-center justify-start p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Coins className="h-6 w-6 mr-3" />
                        <span>Staking</span>
                      </button>
                    )}
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/audit" 
                        className={`flex items-center justify-start p-3 rounded-lg ${isActive('/audit')}`}
                        onClick={closeMobileMenu}
                      >
                        <Shield className="h-6 w-6 mr-3" />
                        <span>Audit</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          setShowAuthPopup(true);
                        }}
                        className={`flex items-center justify-start p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Shield className="h-6 w-6 mr-3" />
                        <span>Audit</span>
                      </button>
                    )}
                  </li>
                  <li>
                    {privyUser ? (
                      <Link 
                        to="/profile" 
                        className={`flex items-center justify-start p-3 rounded-lg ${isActive('/profile')}`}
                        onClick={closeMobileMenu}
                      >
                        <User className="h-6 w-6 mr-3" />
                        <span>Profile</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          login();
                        }}
                        className={`flex items-center justify-start p-3 rounded-lg w-full text-left ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <User className="h-6 w-6 mr-3" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </li>
                </ul>
              </nav>
              
              {privyUser && (
                <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button 
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className={`flex items-center justify-center md:justify-start w-full p-3 rounded-lg ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="h-6 w-6 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <main className={`flex-1 overflow-y-auto ${isBookPage ? 'pt-0' : 'md:pt-0'}`}>
            <Outlet />
          </main>
        </div>
        <Footer />
      </div>
      
      {showAuthPopup && (
        <AuthPopup onClose={() => setShowAuthPopup(false)} />
      )}
    </>
  );
};

export default Layout;