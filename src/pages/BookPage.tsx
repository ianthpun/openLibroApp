import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import BookReader from '../components/BookReader';

const BookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, fetchBooks, setCurrentBook, currentBook } = useBookStore();
  
  useEffect(() => {
    if (books.length === 0) {
      fetchBooks();
    }
  }, [books.length, fetchBooks]);
  
  useEffect(() => {
    if (id && books.length > 0) {
      const bookId = parseInt(id, 10);
      const book = books.find(b => b.id === bookId);
      
      if (book) {
        setCurrentBook(book);
      } else {
        navigate('/');
      }
    }
  }, [id, books, setCurrentBook, navigate]);
  
  if (!currentBook) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <BookReader book={currentBook} />
    </div>
  );
};

export default BookPage;