import React, { useEffect } from 'react';
import { useBookStore } from '../store/bookStore';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { Search } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const SearchPage: React.FC = () => {
  const { filteredBooks, fetchBooks, isLoading, searchQuery, bookmarks, fetchBookmarks } = useBookStore();
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  
  useEffect(() => {
    if (user) {
      fetchBookmarks(user.id);
    }
  }, [user, fetchBookmarks]);
  
  const getBookmark = (bookId: number) => {
    return bookmarks.find(bookmark => bookmark.book_id === bookId);
  };
  
  return (
    <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900' : ''} h-full flex flex-col content-container`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Search Books</h1>
        <ThemeToggle />
      </div>
      
      <div className="mb-6">
        <SearchBar />
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64 flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Searching books...</p>
          </div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="flex items-center justify-center h-64 flex-1">
          <div className="text-center max-w-md">
            <Search className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              {searchQuery ? 'No results found' : 'Start searching'}
            </h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {searchQuery 
                ? `We couldn't find any books matching "${searchQuery}". Try a different search term.` 
                : 'Enter a search term to find books in the library.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 flex-1">
          {filteredBooks.map((book, index) => (
            <BookCard 
              key={`search-book-${book.id}-${index}`} 
              book={book} 
              bookmark={getBookmark(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;