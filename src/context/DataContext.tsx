'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface BaseItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
  created_at?: string;
}

interface DataContextType {
  items: BaseItem[];
  loading: boolean;
  addItem: (item: Omit<BaseItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearItems: () => void;
}

const DataContext = createContext<DataContextType>({
  items: [],
  loading: false,
  addItem: async () => {},
  deleteItem: async () => {},
  clearItems: () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<BaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    // Load initial user data here
    // In React Context, data resets on logout and re-fetches for a new user
    setLoading(true);
    // Placeholder demonstration
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [user]);

  const addItem = async (newItem: Omit<BaseItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const item: BaseItem = {
      ...newItem,
      id: Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    // Prepend (newest first)
    setItems((prev) => [item, ...prev]);
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearItems = () => {
    setItems([]);
  };

  return (
    <DataContext.Provider value={{ items, loading, addItem, deleteItem, clearItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

