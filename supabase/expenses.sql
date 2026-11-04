-- Supabase SQL schema for Expenses table

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Food', 'Transport', 'Shopping', 'Bills', 'Other')),
    spent_on DATE NOT NULL,
    note VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can select only their own records
CREATE POLICY "Users can read own expenses"
    ON expenses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can insert rows only for themselves
CREATE POLICY "Users can insert own expenses"
    ON expenses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can delete only their own records
CREATE POLICY "Users can delete own expenses"
    ON expenses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

