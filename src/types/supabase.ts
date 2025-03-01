export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: number
          title: string
          author: string
          cover_url: string
          summary: string
          content: string
          created_at: string
          genre: string | null
          edition: string | null
        }
        Insert: {
          id?: number
          title: string
          author: string
          cover_url: string
          summary: string
          content: string
          created_at?: string
          genre?: string | null
          edition?: string | null
        }
        Update: {
          id?: number
          title?: string
          author?: string
          cover_url?: string
          summary?: string
          content?: string
          created_at?: string
          genre?: string | null
          edition?: string | null
        }
      }
      bookmarks: {
        Row: {
          id: number
          user_id: string
          privy_id?: string
          book_id: number
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string
          privy_id: string
          book_id: number
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          privy_id?: string
          book_id?: number
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          book_id: number
          title: string
          index: number
          content: string[]
          created_at: string
        }
        Insert: {
          id?: string
          book_id: number
          title: string
          index: number
          content: string[]
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: number
          title?: string
          index?: number
          content?: string[]
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          privy_id?: string
          book_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string
          privy_id: string
          book_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          privy_id?: string
          book_id?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          privy_id: string
          email: string | null
          wallet_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          privy_id: string
          email?: string | null
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          privy_id?: string
          email?: string | null
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}