'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface ExpenseRecord {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  spent_on: string;
  note: string;
  created_at?: string;
}

interface DataContextType {
  expenses: ExpenseRecord[];
  loading: boolean;
  addExpense: (expense: {
    amount: number;
    category: string;
    spent_on: string;
    note: string;
  }) => Promise<{ error: any | null }>;
  deleteExpense: (id: string) => Promise<{ error: any | null }>;
  refreshExpenses: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  expenses: [],
  loading: false,
  addExpense: async () => ({ error: null }),
  deleteExpense: async () => ({ error: null }),
  refreshExpenses: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('spent_on', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        // Log friendly warning if table has not been created yet in Supabase
        if (error.code === 'PGRST205') {
          console.warn(
            'Notice: Table "expenses" does not exist yet in Supabase. Please run supabase/expenses.sql in your Supabase SQL Editor.'
          );
        } else {
          console.error('Error fetching expenses from Supabase:', error.message || error);
        }
      } else if (data) {
        setExpenses(data as ExpenseRecord[]);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load once after login and clear on logout / different user login
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setExpenses([]);
    }
  }, [user, fetchExpenses]);

  const addExpense = async (newExpense: {
    amount: number;
    category: string;
    spent_on: string;
    note: string;
  }) => {
    if (!user) return { error: new Error('User not logged in') };

    const payload = {
      user_id: user.id,
      amount: newExpense.amount,
      category: newExpense.category,
      spent_on: newExpense.spent_on,
      note: newExpense.note || '',
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { error };
    }

    if (data) {
      // Prepend to show immediately in the list
      setExpenses((prev) => [data as ExpenseRecord, ...prev]);
    }

    return { error: null };
  };

  const deleteExpense = async (id: string) => {
    if (!user) return { error: new Error('User not logged in') };

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      return { error };
    }

    setExpenses((prev) => prev.filter((item) => item.id !== id));
    return { error: null };
  };

  return (
    <DataContext.Provider
      value={{
        expenses,
        loading,
        addExpense,
        deleteExpense,
        refreshExpenses: fetchExpenses,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
