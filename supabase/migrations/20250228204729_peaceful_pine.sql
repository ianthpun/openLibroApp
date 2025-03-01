/*
  # Fix books table access policies

  1. Changes
     - Update books table policies to allow public access for reading
     - Ensure all users can view books without authentication

  2. Security
     - Maintain RLS for bookmarks and favorites
     - Only modify access to books which should be publicly readable
*/

-- Drop existing policies on books table
DROP POLICY IF EXISTS "Anyone can read books" ON books;

-- Create a new policy that allows anyone to read books
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  TO public
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE books ENABLE ROW LEVEL SECURITY;