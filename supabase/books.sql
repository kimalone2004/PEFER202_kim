-- Supabase SQL schema for books table (ShelfLife)

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(80) NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 80),
    author VARCHAR(60) NOT NULL CHECK (char_length(trim(author)) > 0 AND char_length(author) <= 60),
    pages INTEGER NOT NULL CHECK (pages >= 1 AND pages <= 5000),
    status TEXT NOT NULL DEFAULT 'To Read' CHECK (status IN ('To Read', 'Reading', 'Finished')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can read only their own books
CREATE POLICY "Users can read own books"
    ON books
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can insert rows only for themselves
CREATE POLICY "Users can insert own books"
    ON books
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can update only their own books (change status, etc.)
CREATE POLICY "Users can update own books"
    ON books
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can delete only their own books
CREATE POLICY "Users can delete own books"
    ON books
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
