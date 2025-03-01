import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../store/userStore';
import { useBookStore } from '../store/bookStore';
import { useThemeStore } from '../store/themeStore';
import { User, BookOpen, Clock, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ThemeToggle from '../components/ThemeToggle';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: privyUser, logout: privyLogout, ready } = usePrivy();
  const { user, logout } = useUserStore();
  const { books, bookmarks, favorites } = useBookStore();
  const { isDarkMode } = useThemeStore();
  
  if (!ready || !privyUser) {
    navigate('/login');
    return null;
  }
  
  const getBookDetails = (bookId: number) => {
    return books.find(book => book.id === bookId);
  };
  
  const recentBookmarks = [...bookmarks]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const favoriteBooks = books.filter(book => 
    favorites.some(favorite => favorite.book_id === book.id)
  ).slice(0, 5);
  
  // Get user display name or email
  const userDisplayName = privyUser.email?.address || 
                          privyUser.wallet?.address?.slice(0, 6) + '...' + 
                          privyUser.wallet?.address?.slice(-4) || 
                          'Anonymous User';
  
  const handleLogout = async () => {
    // First call the Privy logout
    await privyLogout();
    // Then call our store logout
    await logout();
    // Navigate to login page
    navigate('/login');
  };
  
  return (
    <div className={`p-4 sm:p-6 max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-900' : ''} content-container`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Profile</h1>
        <ThemeToggle />
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} p-4 rounded-full mx-auto sm:mx-0`}>
            <User className={`h-12 w-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{userDisplayName}</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Member since {new Date(privyUser.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 mb-6`}>
        <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4 flex items-center`}>
          <BookOpen className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          Reading Statistics
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Books in Library</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{books.length}</p>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Books with Bookmarks</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{bookmarks.length}</p>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Favorite Books</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{favorites.length}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4 flex items-center`}>
            <Clock className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            Recent Activity
          </h2>
          
          {recentBookmarks.length === 0 ? (
            <p className={isDarkMode ? 'text-gray-400 py-4' : 'text-gray-600 py-4'}>No recent reading activity.</p>
          ) : (
            <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {recentBookmarks.map(bookmark => {
                const book = getBookDetails(bookmark.book_id);
                return book ? (
                  <li key={bookmark.id} className="py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} truncate`}>{book.title}</h3>
                        <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>{book.author}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-500 text-sm'}>
                          Last read {formatDistanceToNow(new Date(bookmark.updated_at), { addSuffix: true })}
                        </p>
                        <button 
                          onClick={() => navigate(`/book/${book.id}`)}
                          className={`mt-1 text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                        >
                          Continue Reading
                        </button>
                      </div>
                    </div>
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4 flex items-center`}>
            <Heart className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
            Favorite Books
          </h2>
          
          {favoriteBooks.length === 0 ? (
            <p className={isDarkMode ? 'text-gray-400 py-4' : 'text-gray-600 py-4'}>No favorite books yet.</p>
          ) : (
            <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {favoriteBooks.map(book => (
                <li key={book.id} className="py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} truncate`}>{book.title}</h3>
                      <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>{book.author}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/book/${book.id}`)}
                      className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                    >
                      Read Book
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={handleLogout}
          className={`px-4 py-2 ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded-lg transition-colors`}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;