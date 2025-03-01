/*
  # Fix bookmarks and favorites tables

  1. Changes
     - Modify bookmarks table to make user_id nullable
     - Modify favorites table to make user_id nullable
     - Update bookmark and favorite policies to work with privy_id

  2. Security
     - Maintain RLS policies for proper data access
*/

-- Make user_id nullable in bookmarks table
ALTER TABLE bookmarks ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in favorites table
ALTER TABLE favorites ALTER COLUMN user_id DROP NOT NULL;

-- Update bookmarks policies to prioritize privy_id
DROP POLICY IF EXISTS "Users can read their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;

CREATE POLICY "Users can read their own bookmarks"
  ON bookmarks
  FOR SELECT
  TO authenticated
  USING (privy_id = auth.uid()::text);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (privy_id = auth.uid()::text);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks
  FOR UPDATE
  TO authenticated
  USING (privy_id = auth.uid()::text)
  WITH CHECK (privy_id = auth.uid()::text);

-- Update favorites policies to prioritize privy_id
DROP POLICY IF EXISTS "Users can read their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

CREATE POLICY "Users can read their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (privy_id = auth.uid()::text);

CREATE POLICY "Users can create their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (privy_id = auth.uid()::text);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (privy_id = auth.uid()::text);