import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ArrowLeft,
  Moon,
  Sun,
  Heart,
  List,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useBookStore } from '../store/bookStore';
import { useThemeStore } from '../store/themeStore';
import { usePrivy } from '@privy-io/react-auth';
import AuthPopup from './AuthPopup';
import type { Book, Chapter } from '../lib/flow';

interface BookReaderProps {
  book: Book;
}

const BookReader: React.FC<BookReaderProps> = ({ book }) => {
  const navigate = useNavigate();
  const { user: privyUser } = usePrivy();
  const {
    saveBookmark,
    getBookmark,
    isFavorite,
    toggleFavorite,
    fetchBookChapters,
    currentChapters,
  } = useBookStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const contentRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [pageContents, setPageContents] = useState<string[][]>([]);
  const [bookmarkLoaded, setBookmarkLoaded] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authPopupMessage, setAuthPopupMessage] = useState('');

  // Fetch chapters when book changes
  useEffect(() => {
    if (book) {
      fetchBookChapters(book.id);
    }
  }, [book, fetchBookChapters]);

  // Process the book content to properly handle paragraphs
  const processedContent = useMemo(() => {
    if (currentChapters.length === 0) {
      // Fallback to book content if no chapters are available
      // Make sure book.content exists before trying to use it
      if (typeof book.content === 'string') {
        return book.content
          .replace(/\\n\\n/g, '\n\n') // Replace literal \n\n with actual newlines
          .split('\n\n') // Split by actual paragraph breaks
          .filter((paragraph) => paragraph.trim() !== '');
      } else {
        // If book.content is not a string, return an empty array or a default message
        return ['No content available for this book.'];
      }
    }

    // Use the current chapter's content
    const currentChapter = currentChapters[currentChapterIndex];
    return currentChapter ? currentChapter.content : [];
  }, [book, currentChapters, currentChapterIndex]);

  // Calculate pages and distribute content
  useEffect(() => {
    const calculatePages = () => {
      if (!contentWrapperRef.current) return;

      // Get the available height for content
      const headerHeight = 73; // Header height in pixels
      const footerHeight = 57; // Footer height in pixels
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - headerHeight - footerHeight - 40; // 40px for padding

      // Create a temporary element to measure content
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.width = `${
        contentWrapperRef.current.clientWidth - 80
      }px`; // Account for padding
      tempElement.style.padding = '20px';
      tempElement.style.fontSize = '16px';
      tempElement.style.lineHeight = '1.5';
      document.body.appendChild(tempElement);

      const pages: string[][] = [[]];
      let currentPageIndex = 0;
      let currentPageHeight = 0;

      // Distribute paragraphs across pages
      processedContent.forEach((paragraph) => {
        tempElement.textContent = paragraph;
        const paragraphHeight = tempElement.clientHeight + 16; // Add margin

        if (
          currentPageHeight + paragraphHeight > availableHeight &&
          currentPageHeight > 0
        ) {
          // Start a new page
          currentPageIndex++;
          pages[currentPageIndex] = [paragraph];
          currentPageHeight = paragraphHeight;
        } else {
          // Add to current page
          if (!pages[currentPageIndex]) {
            pages[currentPageIndex] = [];
          }
          pages[currentPageIndex].push(paragraph);
          currentPageHeight += paragraphHeight;
        }
      });

      // Clean up
      document.body.removeChild(tempElement);

      // Ensure we have at least one page
      if (pages.length === 0 || (pages.length === 1 && pages[0].length === 0)) {
        pages[0] = ['No content available for this ssbook.'];
      }

      setPageContents(pages);
      setTotalPages(pages.length);
    };

    // Initial calculation
    calculatePages();

    // Recalculate on window resize
    window.addEventListener('resize', calculatePages);

    return () => {
      window.removeEventListener('resize', calculatePages);
    };
  }, [processedContent]);

  // Load bookmark after pages are calculated
  useEffect(() => {
    if (!bookmarkLoaded && privyUser && totalPages > 0) {
      const bookmark = getBookmark(privyUser.id, book.id);
      if (bookmark && bookmark.position < totalPages) {
        setCurrentPage(bookmark.position);
      }
      setBookmarkLoaded(true);
    }
  }, [privyUser, book.id, getBookmark, bookmarkLoaded, totalPages]);

  // Save bookmark when position changes
  useEffect(() => {
    if (privyUser && bookmarkLoaded) {
      const saveBookmarkDebounced = setTimeout(() => {
        saveBookmark(privyUser.id, book.id, currentPage);
      }, 1000);

      return () => clearTimeout(saveBookmarkDebounced);
    }
  }, [currentPage, privyUser, book.id, saveBookmark, bookmarkLoaded]);

  const handlePrevPage = () => {
    if (currentPage > 0 && !isPageTurning) {
      setDirection('prev');
      setIsPageTurning(true);

      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsPageTurning(false);
      }, 300);
    } else if (currentPage === 0 && currentChapterIndex > 0 && !isPageTurning) {
      // Go to previous chapter
      setDirection('prev');
      setIsPageTurning(true);

      setTimeout(() => {
        setCurrentChapterIndex(currentChapterIndex - 1);
        setCurrentPage(0); // We'll set to the last page after the chapter loads
        setIsPageTurning(false);
      }, 300);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1 && !isPageTurning) {
      setDirection('next');
      setIsPageTurning(true);

      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsPageTurning(false);
      }, 300);
    } else if (
      currentPage === totalPages - 1 &&
      currentChapterIndex < currentChapters.length - 1 &&
      !isPageTurning
    ) {
      // Go to next chapter
      setDirection('next');
      setIsPageTurning(true);

      setTimeout(() => {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentPage(0); // Reset to first page of new chapter
        setIsPageTurning(false);
      }, 300);
    }
  };

  const handleSaveBookmark = () => {
    if (privyUser) {
      saveBookmark(privyUser.id, book.id, currentPage);
    } else {
      setAuthPopupMessage('Sign in to bookmark your reading progress');
      setShowAuthPopup(true);
    }
  };

  const handleToggleFavorite = () => {
    if (privyUser) {
      toggleFavorite(privyUser.id, book.id);
    } else {
      setAuthPopupMessage('Sign in to add this book to your favorites');
      setShowAuthPopup(true);
    }
  };

  const handleChapterSelect = (index: number) => {
    if (index !== currentChapterIndex) {
      setDirection('next');
      setIsPageTurning(true);

      setTimeout(() => {
        setCurrentChapterIndex(index);
        setCurrentPage(0); // Reset to first page of new chapter
        setShowChapterList(false); // Close the chapter list
        setIsPageTurning(false);
      }, 300);
    } else {
      setShowChapterList(false);
    }
  };

  // Toggle reader controls on tap
  const handleContentTap = (e: React.MouseEvent) => {
    // Get the click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element

    // Determine if click was on left third, right third, or middle third
    const width = rect.width;
    const leftThird = width / 3;
    const rightThird = (width * 2) / 3;

    if (x < leftThird) {
      // Left side tap - go to previous page
      handlePrevPage();
    } else if (x > rightThird) {
      // Right side tap - go to next page
      handleNextPage();
    } else {
      // Middle tap - toggle navigation buttons only, not header/footer
      setShowControls(!showControls);
    }
  };

  const isBookFavorite = isFavorite(book.id);

  // Get content for current page
  const currentPageContent = pageContents[currentPage] || [];

  // Get content for adjacent page (for animation)
  const adjacentPageIndex =
    direction === 'next' ? currentPage + 1 : currentPage - 1;
  const adjacentPageContent = pageContents[adjacentPageIndex] || [];

  // Get current chapter title
  const currentChapterTitle =
    currentChapters.length > 0
      ? currentChapters[currentChapterIndex]?.title || 'Chapter 1'
      : 'Chapter 1';

  return (
    <>
      <div
        className={`flex flex-col h-screen ${
          isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        {/* Header - always visible */}
        <div
          className={`${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          } border-b p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-10`}
        >
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center ${
              isDarkMode
                ? 'text-gray-300 hover:text-gray-100'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="text-center flex-1 mx-2">
            <h1
              className={`text-lg sm:text-xl font-semibold ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              } truncate`}
            >
              {book.title}
            </h1>
            <p
              className={`text-xs sm:text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              } truncate`}
            >
              {book.author}
            </p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleSaveBookmark}
              className={`${
                isDarkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-500 hover:text-blue-700'
              } flex items-center`}
              aria-label="Bookmark"
            >
              <Bookmark className="h-5 w-5" />
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`flex items-center ${
                isBookFavorite
                  ? 'text-red-500 hover:text-red-400'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label={
                isBookFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <Heart
                className={`h-5 w-5 ${isBookFavorite ? 'fill-current' : ''}`}
              />
            </button>

            <button
              onClick={() => setShowChapterList(true)}
              className={`flex items-center ${
                isDarkMode
                  ? 'text-gray-300 hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Chapters"
            >
              <List className="h-5 w-5" />
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentWrapperRef}
          className="flex-1 relative overflow-hidden pt-24 pb-16"
          onClick={handleContentTap}
        >
          <div className="absolute inset-0 flex justify-center pt-16">
            <div className="relative w-full max-w-3xl h-full mx-auto">
              {/* Chapter title */}
              <div
                className={`mt-2 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {currentChapterTitle}
              </div>

              {/* Current page */}
              <div
                className={`absolute inset-0 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-md transition-transform duration-300 ease-in-out ${
                  isPageTurning
                    ? direction === 'next'
                      ? 'animate-page-turn-out-left'
                      : 'animate-page-turn-out-right'
                    : ''
                }`}
              >
                <div
                  ref={contentRef}
                  className="h-full p-6 md:p-10 pt-12 overflow-auto"
                >
                  {currentPageContent.map((paragraph, index) => (
                    <p
                      key={`current-${index}`}
                      className={`mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-800'
                      } leading-relaxed text-base sm:text-lg`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Next/Previous page (for animation) */}
              {isPageTurning && (
                <div
                  className={`absolute inset-0 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow-md transition-transform duration-300 ease-in-out ${
                    direction === 'next'
                      ? 'animate-page-turn-in-right'
                      : 'animate-page-turn-in-left'
                  }`}
                >
                  <div className="h-full p-6 md:p-10 pt-12 overflow-auto">
                    {adjacentPageContent.map((paragraph, index) => (
                      <p
                        key={`adjacent-${index}`}
                        className={`mb-4 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-800'
                        } leading-relaxed text-base sm:text-lg`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation buttons - these can still be toggled */}
          <button
            onClick={handlePrevPage}
            disabled={
              (currentPage === 0 && currentChapterIndex === 0) || isPageTurning
            }
            className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } rounded-full p-2 shadow-md z-10 transition-opacity duration-300 ${
              (currentPage === 0 && currentChapterIndex === 0) || isPageTurning
                ? 'opacity-50 cursor-not-allowed'
                : isDarkMode
                ? 'hover:bg-gray-600'
                : 'hover:bg-gray-100'
            } ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft
              className={`h-6 w-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            />
          </button>

          <button
            onClick={handleNextPage}
            disabled={
              (currentPage >= totalPages - 1 &&
                currentChapterIndex >= currentChapters.length - 1) ||
              isPageTurning
            }
            className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } rounded-full p-2 shadow-md z-10 transition-opacity duration-300 ${
              (currentPage >= totalPages - 1 &&
                currentChapterIndex >= currentChapters.length - 1) ||
              isPageTurning
                ? 'opacity-50 cursor-not-allowed'
                : isDarkMode
                ? 'hover:bg-gray-600'
                : 'hover:bg-gray-100'
            } ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Next page"
          >
            <ChevronRight
              className={`h-6 w-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            />
          </button>
        </div>

        {/* Footer - always visible */}
        <div
          className={`${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          } border-t p-3 flex justify-center fixed bottom-0 left-0 right-0`}
        >
          <div
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {currentChapters.length > 1 && (
              <span className="mr-2">
                Ch {currentChapterIndex + 1}/{currentChapters.length}
              </span>
            )}
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>

        {/* Chapter List Modal */}
        {showChapterList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div
              className={`w-full max-w-md rounded-lg shadow-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } overflow-hidden`}
            >
              <div
                className={`p-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                } flex justify-between items-center`}
              >
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}
                >
                  Chapters
                </h3>
                <button
                  onClick={() => setShowChapterList(false)}
                  className={`p-1 rounded-full ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  }`}
                  aria-label="Close chapters list"
                >
                  <X
                    className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <ul
                  className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}
                >
                  {currentChapters.map((chapter, index) => (
                    <li key={chapter.id}>
                      <button
                        onClick={() => handleChapterSelect(index)}
                        className={`w-full text-left py-3 px-2 rounded-lg ${
                          currentChapterIndex === index
                            ? isDarkMode
                              ? 'bg-blue-900 text-blue-100'
                              : 'bg-blue-100 text-blue-800'
                            : isDarkMode
                            ? 'hover:bg-gray-700 text-gray-200'
                            : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{chapter.title}</span>
                          {currentChapterIndex === index && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode
                                  ? 'bg-blue-800 text-blue-200'
                                  : 'bg-blue-200 text-blue-800'
                              }`}
                            >
                              Current
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Popup */}
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        message={authPopupMessage}
      />
    </>
  );
};

export default BookReader;
