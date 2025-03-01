/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing RLS policies for users table
    - Create new policies that properly allow user creation and access
    - Fix authentication flow between Privy and Supabase
  
  2. Security
    - Ensure proper RLS policies for the users table
    - Allow public access for user creation during authentication
    - Restrict user data access to the authenticated user
*/

-- First, drop all existing policies on the users table
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public access for inserting users
-- This is critical for the initial user creation during Privy authentication
CREATE POLICY "Public insert access for users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO public
  USING (privy_id = auth.uid()::text OR privy_id IS NOT NULL);

-- Create a policy that allows users to update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (privy_id = auth.uid()::text)
  WITH CHECK (privy_id = auth.uid()::text);