/*
  # Add Privy integration

  1. New Tables
    - Update `users` table to support Privy authentication
  
  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users
*/

-- Create users table for Privy integration if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_id TEXT UNIQUE NOT NULL,
  email TEXT,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = privy_id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = privy_id)
  WITH CHECK (auth.uid()::text = privy_id);

-- Update bookmarks and favorites tables to reference privy_id instead of user_id
-- First, add a new column to store privy_id
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS privy_user_id TEXT;
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS privy_user_id TEXT;

-- Create function to handle Privy authentication
CREATE OR REPLACE FUNCTION public.handle_privy_auth()
RETURNS TRIGGER AS $$
BEGIN
  NEW.privy_user_id := auth.uid()::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set privy_user_id
CREATE TRIGGER set_privy_user_id_bookmarks
BEFORE INSERT ON bookmarks
FOR EACH ROW
EXECUTE FUNCTION handle_privy_auth();

CREATE TRIGGER set_privy_user_id_favorites
BEFORE INSERT ON favorites
FOR EACH ROW
EXECUTE FUNCTION handle_privy_auth();

-- Update RLS policies for bookmarks to use privy_id
DROP POLICY IF EXISTS "Users can read their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;

CREATE POLICY "Users can read their own bookmarks"
  ON bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = privy_user_id OR auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = privy_user_id OR auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = privy_user_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid()::text = privy_user_id OR auth.uid() = user_id);

-- Update RLS policies for favorites to use privy_id
DROP POLICY IF EXISTS "Users can read their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

CREATE POLICY "Users can read their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = privy_user_id OR auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = privy_user_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = privy_user_id OR auth.uid() = user_id);