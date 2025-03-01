import React, { useEffect, useState } from 'react';
import { useBookStore } from '../store/bookStore';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import BookCard from '../components/BookCard';
import { BookOpen, Heart } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LibraryPage: React.FC = () => {
  const { books, fetchBooks, isLoading, bookmarks, fetchBookmarks, favorites, fetchFavorites } = useBookStore();
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  const [showFavorites, setShowFavorites] = useState(false);
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  
  useEffect(() => {
    if (user) {
      fetchBookmarks(user.id);
      fetchFavorites(user.id);
    }
  }, [user, fetchBookmarks, fetchFavorites]);
  
  const getBookmark = (bookId: number) => {
    return bookmarks.find(bookmark => bookmark.book_id === bookId);
  };

  const filteredBooks = showFavorites 
    ? books.filter(book => favorites.some(fav => fav.book_id === book.id))
    : books;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full content-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading library...</p>
        </div>
      </div>
    );
  }
  
  if (books.length === 0) {
    return (
      <div className="flex items-center justify-center h-full content-container">
        <div className="text-center max-w-md p-6">
          <BookOpen className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Your library is empty</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No books found in your library. Books will appear here once they're added to the database.
          </p>
        </div>
      </div>
    );
  }

  if (showFavorites && filteredBooks.length === 0) {
    return (
      <div className="p-6 content-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Your Favorites</h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setShowFavorites(false)}
              className={`px-3 py-2 text-sm rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Show All
            </button>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md p-6">
            <Heart className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>No favorites yet</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              You haven't added any books to your favorites. Click the heart icon on a book to add it to your favorites.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900' : ''} h-full flex flex-col content-container`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
        <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          {showFavorites ? 'Your Favorites' : 'Your Library'}
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm sm:text-base flex-1 sm:flex-none ${
              showFavorites
                ? isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : isDarkMode 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${showFavorites ? '' : 'fill-current'}`} />
            {showFavorites ? 'Show All' : 'Favorites'}
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 flex-1">
        {filteredBooks.map((book, index) => (
          <BookCard 
            key={`book-${book.id}-${index}`} 
            book={book} 
            bookmark={getBookmark(book.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;