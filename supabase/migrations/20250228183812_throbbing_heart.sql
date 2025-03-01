/*
  # Create books and bookmarks tables

  1. New Tables
    - `books`
      - `id` (integer, primary key)
      - `title` (text, not null)
      - `author` (text, not null)
      - `cover_url` (text)
      - `description` (text)
      - `content` (text, not null)
      - `created_at` (timestamptz, default now())
    - `bookmarks`
      - `id` (integer, primary key)
      - `user_id` (uuid, not null, references auth.users)
      - `book_id` (integer, not null, references books)
      - `position` (integer, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read books
    - Add policies for authenticated users to read, create, and update their own bookmarks
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  description TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Books policies (all authenticated users can read all books)
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  TO authenticated
  USING (true);

-- Bookmarks policies (users can only access their own bookmarks)
CREATE POLICY "Users can read their own bookmarks"
  ON bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);