/*
  # Fix RLS policies for Privy integration
  
  1. Changes
    - Create a new migration to fix RLS policies for the users table
    - Allow public access for inserting into the users table
    - Ensure proper access control for other operations
  
  2. Security
    - Maintain security while allowing proper integration with Privy authentication
*/

-- First, ensure we have the right policies for the users table
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create a policy that allows anyone to insert into the users table
-- This is necessary for initial user creation during authentication
CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = privy_id OR id::text = auth.uid()::text);

-- Create a policy that allows users to update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = privy_id OR id::text = auth.uid()::text)
  WITH CHECK (auth.uid()::text = privy_id OR id::text = auth.uid()::text);