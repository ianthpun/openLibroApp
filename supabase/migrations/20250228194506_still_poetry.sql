/*
  # Add favorites table

  1. New Tables
    - `favorites`
      - `id` (serial, primary key)
      - `user_id` (uuid, references auth.users)
      - `book_id` (integer, references books)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `favorites` table
    - Add policies for authenticated users to manage their favorites
*/

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies (users can only access their own favorites)
CREATE POLICY "Users can read their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);