import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useThemeStore } from '../store/themeStore';
import { useBookStore } from '../store/bookStore';
import { usePrivy } from '@privy-io/react-auth';
import AuthPopup from './AuthPopup';
import type { Database } from '../types/supabase';

type Book = Database['public']['Tables']['books']['Row'];
type Bookmark = Database['public']['Tables']['bookmarks']['Row'];

interface BookCardProps {
  book: Book;
  bookmark?: Bookmark;
}

const BookCard: React.FC<BookCardProps> = ({ book, bookmark }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const { isFavorite, toggleFavorite } = useBookStore();
  const { user: privyUser } = usePrivy();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (privyUser) {
      toggleFavorite(privyUser.id, book.id);
    } else {
      setShowAuthPopup(true);
    }
  };
  
  const isBookFavorite = isFavorite(book.id);
  
  return (
    <>
      <div 
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] w-full`}
        onClick={handleClick}
        style={{ maxHeight: '320px' }}
      >
        <div className="relative h-28 overflow-hidden">
          <img 
            src={book.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=2730&ixlib=rb-4.0.3'} 
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            {bookmark && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center text-xs">
                <Bookmark className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">
                  Last read {formatDistanceToNow(new Date(bookmark.updated_at), { addSuffix: true })}
                </span>
                <span className="sm:hidden">
                  {formatDistanceToNow(new Date(bookmark.updated_at), { addSuffix: true })}
                </span>
              </div>
            )}
            <button 
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-full ${
                isBookFavorite 
                  ? 'bg-red-500 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              aria-label={isBookFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${isBookFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        <div className="p-3">
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} truncate`}>{book.title}</h3>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{book.author}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} line-clamp-2`}>{book.summary}</p>
          
          {book.genre && (
            <div className="mt-2 flex items-center">
              <Tag className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-1`} />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {book.genre}
              </span>
            </div>
          )}
        </div>
      </div>

      <AuthPopup 
        isOpen={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)}
        message="Sign in to add this book to your favorites"
      />
    </>
  );
};

export default BookCard;