'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, RotateCcw, Trash2, Wallet, Layers, Calendar, Tag } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useData();

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  // Messages & form errors
  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    date?: string;
    note?: string;
    expense?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters state
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const validate = (a: string, c: string, d: string, n: string) => {
    const errs: typeof errors = {};

    if (!a.trim()) {
      errs.amount = 'Amount is required';
    } else {
      const num = parseFloat(a);
      if (isNaN(num) || num <= 0) {
        errs.amount = 'Amount must be greater than 0';
      }
    }

    if (!c) {
      errs.category = 'Please choose a category';
    }

    if (!d) {
      errs.date = 'Date is required';
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (d > today) {
        errs.date = 'Date cannot be in the future';
      }
    }

    if (n && n.length > 100) {
      errs.note = 'Note must be at most 100 characters';
    }

    return errs;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmount(val);
    if (submitted) {
      const errs = validate(val, category, date, note);
      setErrors((prev) => ({ ...prev, amount: errs.amount, expense: undefined }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (submitted) {
      const errs = validate(amount, val, date, note);
      setErrors((prev) => ({ ...prev, category: errs.category, expense: undefined }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDate(val);
    if (submitted) {
      const errs = validate(amount, category, val, note);
      setErrors((prev) => ({ ...prev, date: errs.date, expense: undefined }));
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNote(val);
    if (submitted) {
      const errs = validate(amount, category, date, val);
      setErrors((prev) => ({ ...prev, note: errs.note, expense: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(amount, category, date, note);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    const { error } = await addExpense({
      amount: parseFloat(amount),
      category,
      spent_on: date,
      note: note.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      setErrors((prev) => ({
        ...prev,
        expense: error.message || 'Error adding expense to Supabase',
      }));
    } else {
      setAmount('');
      setCategory('');
      setDate('');
      setNote('');
      setSubmitted(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
  };

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterMonth('');
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterMonth && !item.spent_on.startsWith(filterMonth)) return false;
    return true;
  });

  // Calculate summary
  const totalAmount = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const expenseCount = filteredExpenses.length;

  const categoryBreakdown = Object.entries(
    filteredExpenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .map(([cat, total]) => ({ category: cat, total }));

  return (
    <ProtectedRoute>
      <div data-testid="expenses-page" className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1c2e22]">
              Expenses Manager
            </h1>
            <p className="text-sm text-[#5a705e] mt-1">
              Track, organize, and inspect your financial footprint
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Filters */}
          <div className="space-y-6">
            <Card className="rounded-[2rem] border-[#e3ebd9] bg-white shadow-sm p-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#1c2e22]">
                  <PlusCircle className="w-5 h-5 text-[#2d5a37]" /> Add Expense
                </CardTitle>
              </CardHeader>
              <form data-testid="expense-form" noValidate onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {success && (
                    <div
                      data-testid="expense-success"
                      className="p-3 text-sm text-[#204028] bg-[#e9f2e4] border border-[#c5dbb8] rounded-2xl font-semibold"
                    >
                      Expense added
                    </div>
                  )}

                  {errors.expense && (
                    <div
                      data-testid="error-expense"
                      className="p-3 text-sm text-destructive bg-destructive/10 rounded-2xl"
                    >
                      {errors.expense}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      data-testid="input-amount"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
                    />
                    {errors.amount && (
                      <p data-testid="error-amount" className="text-xs text-destructive font-medium">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Category
                    </Label>
                    <select
                      id="category"
                      data-testid="select-category"
                      value={category}
                      onChange={handleCategoryChange}
                      className="flex h-11 w-full rounded-xl border border-[#d8e5cd] bg-white px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2d5a37]"
                    >
                      <option value="">Choose category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p data-testid="error-category" className="text-xs text-destructive font-medium">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      data-testid="input-date"
                      value={date}
                      onChange={handleDateChange}
                      className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
                    />
                    {errors.date && (
                      <p data-testid="error-date" className="text-xs text-destructive font-medium">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="note" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Note (Optional)
                    </Label>
                    <Input
                      id="note"
                      type="text"
                      data-testid="input-note"
                      value={note}
                      onChange={handleNoteChange}
                      placeholder="Short note"
                      className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
                    />
                    {errors.note && (
                      <p data-testid="error-note" className="text-xs text-destructive font-medium">
                        {errors.note}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    data-testid="btn-add-expense"
                    className="w-full h-11 rounded-full bg-[#2d5a37] text-white hover:bg-[#204028] font-bold shadow-md mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                  </Button>
                </CardContent>
              </form>
            </Card>

            {/* Filter Section */}
            <Card className="rounded-[2rem] border-[#e3ebd9] bg-white shadow-sm p-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#1c2e22]">
                  <RotateCcw className="w-5 h-5 text-[#2d5a37]" /> Filter Records
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-category" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                    Filter Category
                  </Label>
                  <select
                    id="filter-category"
                    data-testid="filter-category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-[#d8e5cd] bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2d5a37]"
                  >
                    <option value="">All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="filter-month" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                    Filter Month
                  </Label>
                  <Input
                    id="filter-month"
                    type="month"
                    data-testid="filter-month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
                  />
                </div>

                <Button
                  variant="outline"
                  data-testid="btn-clear-filters"
                  onClick={handleClearFilters}
                  className="w-full h-11 rounded-full border-[#d8e5cd] text-[#2d5a37] hover:bg-[#e9f2e4] font-semibold"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: List & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card className="rounded-[2rem] border-[#e3ebd9] bg-[#e9f2e4]/70 shadow-sm p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-[#2d5a37] flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#2d5a37]" /> Spending Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#d8e5cd]">
                    <span className="text-[11px] font-bold text-[#5a705e] uppercase tracking-wider">
                      Total Amount
                    </span>
                    <p data-testid="total-amount" className="text-2xl sm:text-3xl font-black text-[#2d5a37] mt-1">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#d8e5cd]">
                    <span className="text-[11px] font-bold text-[#5a705e] uppercase tracking-wider">
                      Expenses Count
                    </span>
                    <p data-testid="expense-count" className="text-2xl sm:text-3xl font-black text-[#1c2e22] mt-1">
                      {expenseCount}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#d8e5cd]">
                  <h4 className="text-xs font-bold text-[#5a705e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#2d5a37]" /> Category Breakdown
                  </h4>
                  <div data-testid="category-breakdown" className="space-y-2.5">
                    {categoryBreakdown.length === 0 ? (
                      <p className="text-xs text-[#5a705e] italic">No category data to display</p>
                    ) : (
                      categoryBreakdown.map((row) => (
                        <div
                          key={row.category}
                          data-testid="breakdown-row"
                          className="flex justify-between items-center text-sm py-1.5 border-b border-[#f0f4ea] last:border-0"
                        >
                          <span data-testid="breakdown-name" className="font-semibold text-[#1c2e22]">
                            {row.category}
                          </span>
                          <span data-testid="breakdown-amount" className="font-bold text-[#2d5a37]">
                            ${row.total.toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* List */}
            <Card className="rounded-[2rem] border-[#e3ebd9] bg-white shadow-sm p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-[#1c2e22]">
                  Expense Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExpenses.length === 0 ? (
                  <div data-testid="expenses-empty" className="text-center py-12 text-[#5a705e] text-sm">
                    No expenses found
                  </div>
                ) : (
                  <div data-testid="expense-list" className="space-y-3">
                    {filteredExpenses.map((item) => (
                      <div
                        key={item.id}
                        data-testid="expense-item"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#e3ebd9] bg-[#fbfbf7] hover:bg-[#f4f7ef] transition-colors gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span
                              data-testid="expense-category"
                              className="font-bold text-xs bg-[#2d5a37] text-white px-2.5 py-1 rounded-full shadow-xs"
                            >
                              {item.category}
                            </span>
                            <span data-testid="expense-amount" className="font-black text-lg text-[#1c2e22]">
                              ${Number(item.amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#5a705e]">
                            <span data-testid="expense-date" className="font-semibold">
                              {item.spent_on.replace(/-/g, '')}
                            </span>
                            {item.note && (
                              <span data-testid="expense-note" className="italic text-[#718774]">
                                • {item.note}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid="btn-delete-expense"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-full text-destructive hover:bg-destructive/10 self-end sm:self-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
