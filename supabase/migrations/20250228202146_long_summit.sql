/*
  # Fix Privy integration with Supabase

  1. Changes
    - Update bookmarks and favorites tables to use privy_id (TEXT) instead of user_id (UUID)
    - Update RLS policies to use privy_id for authentication
  
  2. Security
    - Maintain security while allowing proper integration with Privy authentication
*/

-- First drop the policies that depend on the privy_id column
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

-- Now we can safely alter the column type
ALTER TABLE users ALTER COLUMN privy_id TYPE TEXT;

-- Create new policies for the users table
CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

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

-- Update bookmarks table to use privy_id instead of user_id
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS privy_id TEXT;

-- Update favorites table to use privy_id instead of user_id
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS privy_id TEXT;

-- Drop existing policies on bookmarks
DROP POLICY IF EXISTS "Users can read their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;

-- Create new policies for bookmarks using privy_id
CREATE POLICY "Users can read their own bookmarks"
  ON bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = privy_id);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = privy_id);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = privy_id)
  WITH CHECK (auth.uid()::text = privy_id);

-- Drop existing policies on favorites
DROP POLICY IF EXISTS "Users can read their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create new policies for favorites using privy_id
CREATE POLICY "Users can read their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = privy_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = privy_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = privy_id);