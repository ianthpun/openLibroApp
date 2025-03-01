import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import * as flowService from '../lib/flow';
import type { Database } from '../types/supabase';
import type { Book, Chapter } from '../lib/flow';

type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
type Favorite = Database['public']['Tables']['favorites']['Row'];

interface BookState {
  books: Book[];
  filteredBooks: Book[];
  currentBook: Book | null;
  currentChapters: Chapter[];
  bookmarks: Bookmark[];
  favorites: Favorite[];
  isLoading: boolean;
  searchQuery: string;
  
  fetchBooks: () => Promise<void>;
  fetchBookChapters: (bookId: number) => Promise<Chapter[]>;
  searchBooks: (query: string) => void;
  setCurrentBook: (book: Book | null) => void;
  fetchBookmarks: (userId: string) => Promise<void>;
  saveBookmark: (userId: string, bookId: number, position: number) => Promise<void>;
  getBookmark: (userId: string, bookId: number) => Bookmark | undefined;
  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, bookId: number) => Promise<void>;
  isFavorite: (bookId: number) => boolean;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  filteredBooks: [],
  currentBook: null,
  currentChapters: [],
  bookmarks: [],
  favorites: [],
  isLoading: false,
  searchQuery: '',
  
  fetchBooks: async () => {
    set({ isLoading: true });
    try {
      // Try to fetch books from Flow blockchain
      const flowBooks = await flowService.getAllBooks();
      
      // If Flow fetch fails or returns empty, use mock data
      const books = flowBooks.length > 0 ? flowBooks : flowService.getMockBooks();
      
      set({ 
        books, 
        filteredBooks: books,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      
      // Fallback to mock data
      const mockBooks = flowService.getMockBooks();
      set({ 
        books: mockBooks, 
        filteredBooks: mockBooks,
        isLoading: false 
      });
    }
  },
  
  fetchBookChapters: async (bookId: number) => {
    try {
      const book = get().books.find(b => b.id === bookId);
      if (!book) return [];
      
      // Try to fetch chapters from Flow blockchain
      const flowChapters = await flowService.getBookChapters(book.title);
      
      // If Flow fetch fails or returns empty, use mock data
      const chapters = flowChapters.length > 0 ? flowChapters : flowService.getMockChapters(bookId);
      
      set({ currentChapters: chapters });
      return chapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      
      // Fallback to mock data
      const mockChapters = flowService.getMockChapters(bookId);
      set({ currentChapters: mockChapters });
      return mockChapters;
    }
  },
  
  searchBooks: (query: string) => {
    set({ searchQuery: query });
    const { books } = get();
    
    if (!query.trim()) {
      set({ filteredBooks: books });
      return;
    }
    
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.summary.toLowerCase().includes(query.toLowerCase()) ||
      (book.genre && book.genre.toLowerCase().includes(query.toLowerCase()))
    );
    
    set({ filteredBooks: filtered });
  },
  
  setCurrentBook: (book) => {
    set({ currentBook: book });
    if (book) {
      get().fetchBookChapters(book.id);
    } else {
      set({ currentChapters: [] });
    }
  },
  
  fetchBookmarks: async (userId: string) => {
    try {
      // For now, we'll continue using Supabase for bookmarks
      // In a full implementation, we would use Flow blockchain
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('privy_id', userId);
      
      if (error) {
        console.error('Error fetching bookmarks:', error);
        return;
      }
      
      set({ bookmarks: data || [] });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  },
  
  saveBookmark: async (userId: string, bookId: number, position: number) => {
    try {
      const existingBookmark = get().bookmarks.find(
        bookmark => (bookmark.privy_id === userId) && bookmark.book_id === bookId
      );
      
      if (existingBookmark) {
        // Update existing bookmark
        const { error } = await supabase
          .from('bookmarks')
          .update({ 
            position,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBookmark.id);
        
        if (error) {
          console.error('Error updating bookmark:', error);
          return;
        }
        
        // Update local state
        set({
          bookmarks: get().bookmarks.map(bookmark => 
            bookmark.id === existingBookmark.id 
              ? { ...bookmark, position, updated_at: new Date().toISOString() }
              : bookmark
          )
        });
      } else {
        // Create new bookmark
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            privy_id: userId,
            book_id: bookId,
            position,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating bookmark:', error);
          return;
        }
        
        // Update local state
        if (data) {
          set({
            bookmarks: [...get().bookmarks, data]
          });
        }
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  },
  
  getBookmark: (userId: string, bookId: number) => {
    return get().bookmarks.find(
      bookmark => (bookmark.privy_id === userId) && bookmark.book_id === bookId
    );
  },
  
  fetchFavorites: async (userId: string) => {
    try {
      // For now, we'll continue using Supabase for favorites
      // In a full implementation, we would use Flow blockchain
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('privy_id', userId);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }
      
      set({ favorites: data || [] });
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  },
  
  toggleFavorite: async (userId: string, bookId: number) => {
    try {
      const isFavorited = get().favorites.some(
        favorite => (favorite.privy_id === userId) && favorite.book_id === bookId
      );
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('privy_id', userId)
          .eq('book_id', bookId);
        
        if (error) {
          console.error('Error removing favorite:', error);
          return;
        }
        
        // Update local state
        set({
          favorites: get().favorites.filter(
            favorite => !(favorite.privy_id === userId && favorite.book_id === bookId)
          )
        });
      } else {
        // Check if favorite already exists to prevent duplicate key error
        const { data: existingFavorite, error: checkError } = await supabase
          .from('favorites')
          .select('*')
          .eq('privy_id', userId)
          .eq('book_id', bookId)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking for existing favorite:', checkError);
          return;
        }
        
        // Only insert if it doesn't already exist
        if (!existingFavorite) {
          const { data, error } = await supabase
            .from('favorites')
            .insert({
              privy_id: userId,
              book_id: bookId,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) {
            // If we get a duplicate key error, just ignore it
            if (error.code === '23505') {
              console.log('Favorite already exists, skipping insert');
              return;
            }
            console.error('Error creating favorite:', error);
            return;
          }
          
          // Update local state
          if (data) {
            set({
              favorites: [...get().favorites, data]
            });
          }
        } else {
          // If it already exists in the database but not in our local state, add it
          if (!get().favorites.some(f => f.id === existingFavorite.id)) {
            set({
              favorites: [...get().favorites, existingFavorite]
            });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  },
  
  isFavorite: (bookId: number) => {
    return get().favorites.some(favorite => favorite.book_id === bookId);
  }
}));