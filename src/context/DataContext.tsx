'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface BookRecord {
  id: string;
  user_id: string;
  title: string;
  author: string;
  pages: number;
  status: 'To Read' | 'Reading' | 'Finished';
  created_at?: string;
}

interface DataContextType {
  books: BookRecord[];
  loading: boolean;
  addBook: (book: {
    title: string;
    author: string;
    pages: number;
    status: 'To Read' | 'Reading' | 'Finished';
  }) => Promise<{ error: any | null }>;
  advanceBook: (id: string) => Promise<{ error: any | null }>;
  deleteBook: (id: string) => Promise<{ error: any | null }>;
  refreshBooks: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  books: [],
  loading: false,
  addBook: async () => ({ error: null }),
  advanceBook: async () => ({ error: null }),
  deleteBook: async () => ({ error: null }),
  refreshBooks: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (!user) {
      setBooks([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn(
            'Notice: Table "books" does not exist yet in Supabase. Please run supabase/books.sql in your Supabase SQL Editor.'
          );
        } else {
          console.error('Error fetching books from Supabase:', error.message || error);
        }
      } else if (data) {
        setBooks(data as BookRecord[]);
      }
    } catch (err) {
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load once after login and clear on logout / different user login
  useEffect(() => {
    if (user) {
      fetchBooks();
    } else {
      setBooks([]);
    }
  }, [user, fetchBooks]);

  const addBook = async (newBook: {
    title: string;
    author: string;
    pages: number;
    status: 'To Read' | 'Reading' | 'Finished';
  }) => {
    if (!user) return { error: new Error('User not logged in') };

    const payload = {
      user_id: user.id,
      title: newBook.title.trim(),
      author: newBook.author.trim(),
      pages: Number(newBook.pages),
      status: newBook.status,
    };

    const { data, error } = await supabase
      .from('books')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { error };
    }

    if (data) {
      // Prepend to show immediately in the list (most recently added first)
      setBooks((prev) => [data as BookRecord, ...prev]);
    }

    return { error: null };
  };

  const advanceBook = async (id: string) => {
    if (!user) return { error: new Error('User not logged in') };

    const currentBook = books.find((b) => b.id === id);
    if (!currentBook) return { error: new Error('Book not found') };

    let nextStatus: 'To Read' | 'Reading' | 'Finished' = currentBook.status;
    if (currentBook.status === 'To Read') {
      nextStatus = 'Reading';
    } else if (currentBook.status === 'Reading') {
      nextStatus = 'Finished';
    } else {
      return { error: null }; // Already Finished
    }

    const { error } = await supabase
      .from('books')
      .update({ status: nextStatus })
      .eq('id', id);

    if (error) {
      return { error };
    }

    // Update state immediately
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b))
    );

    return { error: null };
  };

  const deleteBook = async (id: string) => {
    if (!user) return { error: new Error('User not logged in') };

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      return { error };
    }

    setBooks((prev) => prev.filter((item) => item.id !== id));
    return { error: null };
  };

  return (
    <DataContext.Provider
      value={{
        books,
        loading,
        addBook,
        advanceBook,
        deleteBook,
        refreshBooks: fetchBooks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
