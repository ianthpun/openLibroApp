import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { linkPrivyWithSupabase } from '../lib/privy';

interface UserState {
  user: any | null;
  isLoading: boolean;
  
  setUser: (user: any | null) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  handlePrivyAuth: (privyUser: any) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  
  setUser: (user) => {
    set({ user });
  },
  
  handlePrivyAuth: async (privyUser) => {
    try {
      set({ isLoading: true });
      
      if (!privyUser) {
        set({ user: null, isLoading: false });
        return;
      }
      
      console.log('Handling Privy auth for user:', privyUser.id);
      
      // Link Privy user with Supabase - but don't throw if it fails
      // This allows the app to function even if the database connection fails
      try {
        const linked = await linkPrivyWithSupabase(privyUser);
        console.log('Privy user linked with Supabase:', linked);
      } catch (err) {
        console.warn('Failed to link Privy with Supabase, but continuing:', err);
      }
      
      // Set the user in state regardless of database success
      // This ensures the app remains functional even with database issues
      set({ 
        user: {
          id: privyUser.id,
          email: privyUser.email?.address || 'Anonymous User',
          created_at: privyUser.created_at || new Date().toISOString(),
          flowAddress: null, // Initialize Flow address as null
          flowUser: null     // Initialize Flow user as null
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error handling Privy auth:', error);
      // Even if there's an error, we should still set isLoading to false
      // to prevent the app from getting stuck in a loading state
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      // Clear the user state
      set({ user: null });
      // No need to call Supabase signout as authentication is handled by Privy
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
  
  checkSession: async () => {
    set({ isLoading: true });
    try {
      // Session checking is now handled by the Privy provider
      set({ isLoading: false });
    } catch (error) {
      console.error('Error checking session:', error);
      set({ isLoading: false });
    }
  }
}));