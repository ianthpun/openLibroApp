/*
  # Update database schema to match Flow blockchain structure

  1. Changes
     - Modify books table to match Alexandria contract Book resource
     - Add chapters table to store book chapters
     - Update RLS policies for new structure

  2. New Tables
     - `chapters` 
       - `id` (uuid, primary key)
       - `book_id` (integer, foreign key to books)
       - `title` (text)
       - `index` (integer)
       - `content` (text[])
       - `created_at` (timestamp)

  3. Security
     - Enable RLS on `chapters` table
     - Add policies for authenticated users to read chapters
*/

-- Add new columns to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS edition TEXT DEFAULT '1st';

-- Add summary column (we'll copy data from description to this column)
ALTER TABLE books ADD COLUMN IF NOT EXISTS summary TEXT;

-- Copy data from description to summary
UPDATE books SET summary = description;

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  index INTEGER NOT NULL,
  content TEXT[] NOT NULL, -- Array of paragraphs
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, title)
);

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Create policy for reading chapters
CREATE POLICY "Anyone can read chapters"
  ON chapters
  FOR SELECT
  TO public
  USING (true);

-- Update existing books with genre information
UPDATE books SET genre = 'Fantasy' WHERE id = 1; -- The Midnight Chronicles
UPDATE books SET genre = 'Science Fiction' WHERE id = 2; -- Whispers of the Forgotten Sea
UPDATE books SET genre = 'Science Fiction' WHERE id = 3; -- Echoes of Tomorrow
UPDATE books SET genre = 'Magical Realism' WHERE id = 4; -- The Garden of Hidden Truths
UPDATE books SET genre = 'Fantasy' WHERE id = 5; -- Beyond the Fractured Sky

-- Convert book content to chapters
-- For each book, we'll create a single chapter with the content
DO $$
DECLARE
  book_record RECORD;
  paragraphs TEXT[];
BEGIN
  FOR book_record IN SELECT id, title, content FROM books LOOP
    -- Split content into paragraphs
    paragraphs := string_to_array(book_record.content, '\n\n');
    
    -- Insert as a chapter
    INSERT INTO chapters (book_id, title, index, content, created_at)
    VALUES (
      book_record.id, 
      'Chapter 1', 
      1, 
      paragraphs,
      now()
    );
  END LOOP;
END $$;