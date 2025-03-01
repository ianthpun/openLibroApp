import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useBookStore } from '../store/bookStore';
import { useThemeStore } from '../store/themeStore';

const SearchBar: React.FC = () => {
  const { searchQuery, searchBooks } = useBookStore();
  const { isDarkMode } = useThemeStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchBooks(localQuery);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [localQuery, searchBooks]);
  
  const handleClear = () => {
    setLocalQuery('');
    searchBooks('');
  };
  
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
      </div>
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="Search books..."
        className={`block w-full pl-10 pr-10 py-3 border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-400 focus:border-blue-400' 
            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
        } rounded-lg text-base`}
      />
      {localQuery && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;