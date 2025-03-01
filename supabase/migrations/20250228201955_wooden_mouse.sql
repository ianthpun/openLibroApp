/*
  # Fix users table RLS policies

  1. Changes
    - Update RLS policies for the users table to allow authenticated users to insert records
    - Add policy for unauthenticated users to insert records (needed for initial signup)
    - Fix policy for updating user records
  
  2. Security
    - Maintain security while allowing proper user creation during authentication
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new policies with proper permissions
-- Allow any authenticated user to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = privy_id);

-- Allow any user (authenticated or not) to insert new user records
-- This is needed for initial signup
CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = privy_id)
  WITH CHECK (auth.uid()::text = privy_id);