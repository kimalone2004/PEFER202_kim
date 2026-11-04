'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div data-testid="expenses-page" className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Expenses Manager</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Filters */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
              </CardHeader>
              <form data-testid="expense-form" noValidate onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {success && (
                    <div data-testid="expense-success" className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                      Expense added
                    </div>
                  )}

                  {errors.expense && (
                    <div data-testid="error-expense" className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                      {errors.expense}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      data-testid="input-amount"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                    />
                    {errors.amount && (
                      <p data-testid="error-amount" className="text-xs text-destructive">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      data-testid="select-category"
                      value={category}
                      onChange={handleCategoryChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Choose category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p data-testid="error-category" className="text-xs text-destructive">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      data-testid="input-date"
                      value={date}
                      onChange={handleDateChange}
                    />
                    {errors.date && (
                      <p data-testid="error-date" className="text-xs text-destructive">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                      id="note"
                      type="text"
                      data-testid="input-note"
                      value={note}
                      onChange={handleNoteChange}
                      placeholder="Short note"
                    />
                    {errors.note && (
                      <p data-testid="error-note" className="text-xs text-destructive">
                        {errors.note}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    data-testid="btn-add-expense"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                  </Button>
                </CardContent>
              </form>
            </Card>

            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="filter-category">Filter Category</Label>
                  <select
                    id="filter-category"
                    data-testid="filter-category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="filter-month">Filter Month</Label>
                  <Input
                    id="filter-month"
                    type="month"
                    data-testid="filter-month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  data-testid="btn-clear-filters"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: List & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase">Total Amount</span>
                    <p data-testid="total-amount" className="text-2xl font-bold">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase">Expenses Count</span>
                    <p data-testid="expense-count" className="text-2xl font-bold">
                      {expenseCount}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Category Breakdown</h4>
                  <div data-testid="category-breakdown" className="space-y-2">
                    {categoryBreakdown.map((row) => (
                      <div
                        key={row.category}
                        data-testid="breakdown-row"
                        className="flex justify-between items-center text-sm py-1 border-b border-muted/50 last:border-0"
                      >
                        <span data-testid="breakdown-name" className="font-medium">
                          {row.category}
                        </span>
                        <span data-testid="breakdown-amount" className="text-muted-foreground">
                          ${row.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* List */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Records</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExpenses.length === 0 ? (
                  <div data-testid="expenses-empty" className="text-center py-8 text-muted-foreground">
                    No expenses found
                  </div>
                ) : (
                  <div data-testid="expense-list" className="space-y-3">
                    {filteredExpenses.map((item) => (
                      <div
                        key={item.id}
                        data-testid="expense-item"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              data-testid="expense-category"
                              className="font-semibold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded"
                            >
                              {item.category}
                            </span>
                            <span data-testid="expense-amount" className="font-bold">
                              ${Number(item.amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span data-testid="expense-date">
                              {item.spent_on.replace(/-/g, '')}
                            </span>
                            {item.note && (
                              <span data-testid="expense-note" className="italic">
                                - {item.note}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          data-testid="btn-delete-expense"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
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
