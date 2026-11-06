'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookPlus, Trash2, ArrowRightCircle, BookOpen, Layers, RotateCcw, Search, BookMarked } from 'lucide-react';

const STATUS_CHOICES = ['To Read', 'Reading', 'Finished'] as const;

export default function BooksPage() {
  const { books, addBook, advanceBook, deleteBook } = useData();

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [status, setStatus] = useState<string>('');

  // Messages & form errors
  const [errors, setErrors] = useState<{
    title?: string;
    author?: string;
    pages?: string;
    status?: string;
    book?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters state
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const validate = (t: string, a: string, p: string, s: string) => {
    const errs: typeof errors = {};

    // Title: empty or spaces only / longer than 80 characters
    if (!t.trim()) {
      errs.title = 'Title is required';
    } else if (t.length > 80) {
      errs.title = 'Title must be at most 80 characters';
    }

    // Author: empty or spaces only / longer than 60 characters
    if (!a.trim()) {
      errs.author = 'Author is required';
    } else if (a.length > 60) {
      errs.author = 'Author must be at most 60 characters';
    }

    // Pages: whole number from 1 to 5000
    if (!p.trim()) {
      errs.pages = 'Pages is required';
    } else {
      const pageNum = Number(p);
      if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > 5000) {
        errs.pages = 'Pages must be a whole number from 1 to 5000';
      }
    }

    // Status: nothing chosen
    if (!s) {
      errs.status = 'Please choose a status';
    }

    return errs;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (submitted) {
      const errs = validate(val, author, pages, status);
      setErrors((prev) => ({ ...prev, title: errs.title, book: undefined }));
    }
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthor(val);
    if (submitted) {
      const errs = validate(title, val, pages, status);
      setErrors((prev) => ({ ...prev, author: errs.author, book: undefined }));
    }
  };

  const handlePagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPages(val);
    if (submitted) {
      const errs = validate(title, author, val, status);
      setErrors((prev) => ({ ...prev, pages: errs.pages, book: undefined }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    if (submitted) {
      const errs = validate(title, author, pages, val);
      setErrors((prev) => ({ ...prev, status: errs.status, book: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(title, author, pages, status);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    const pageNum = Number(pages) || 1;
    const { error } = await addBook({
      title: title.trim(),
      author: author.trim(),
      pages: pageNum,
      status: status as 'To Read' | 'Reading' | 'Finished',
    });

    setIsSubmitting(false);

    if (error) {
      setErrors((prev) => ({
        ...prev,
        book: error.message || 'Error adding book to Supabase',
      }));
    } else {
      setTitle('');
      setAuthor('');
      setPages('');
      setStatus('');
      setSubmitted(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleAdvance = async (id: string) => {
    await advanceBook(id);
  };

  const handleDelete = async (id: string) => {
    await deleteBook(id);
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setSearchQuery('');
  };

  // Filter books immediately
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const filteredBooks = books.filter((item) => {
    // Status filter (empty string = All)
    if (filterStatus && item.status !== filterStatus) {
      return false;
    }
    // Search query: title or author contains typed text (not case-sensitive, spaces at both ends ignored)
    if (trimmedSearch) {
      const titleMatch = item.title.toLowerCase().includes(trimmedSearch);
      const authorMatch = item.author.toLowerCase().includes(trimmedSearch);
      if (!titleMatch && !authorMatch) {
        return false;
      }
    }
    return true;
  });

  // Calculate summary on filtered books
  const bookCount = filteredBooks.length;
  const totalPages = filteredBooks.reduce((sum, b) => sum + (Number(b.pages) || 0), 0);

  // Breakdown with one row per status that appears, status with most books first (equal count: To Read, then Reading, then Finished)
  const statusOrder: Record<string, number> = {
    'To Read': 1,
    'Reading': 2,
    'Finished': 3,
  };

  const statusCountMap = filteredBooks.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const breakdown = Object.entries(statusCountMap)
    .sort(([statusA, countA], [statusB, countB]) => {
      if (countB !== countA) {
        return countB - countA; // status with the most books first
      }
      return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99); // tie-breaker
    })
    .map(([statusName, count]) => ({ status: statusName, count }));

  return (
    <ProtectedRoute>
      <div data-testid="books-page" className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1c2e22]">
              Books Shelf
            </h1>
            <p className="text-sm text-[#5a705e] mt-1">
              Organize your books, track reading status, and grow your personal library
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Filters */}
          <div className="space-y-6">
            <Card className="rounded-[2rem] border-[#e3ebd9] bg-white shadow-sm p-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#1c2e22]">
                  <BookPlus className="w-5 h-5 text-[#2d5a37]" /> Add Book
                </CardTitle>
              </CardHeader>
              <form data-testid="book-form" noValidate onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {success && (
                    <div
                      data-testid="book-success"
                      className="p-3 text-sm text-[#204028] bg-[#e9f2e4] border border-[#c5dbb8] rounded-2xl font-semibold"
                    >
                      Book added
                    </div>
                  )}

                  {errors.book && (
                    <div
                      data-testid="error-book"
                      className="p-3 text-sm text-destructive bg-destructive/10 rounded-2xl"
                    >
                      {errors.book}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      data-testid="input-title"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="e.g. The Great Gatsby"
                      className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
                    />
                    {errors.title && (
                      <p data-testid="error-title" className="text-xs text-destructive font-medium">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="author" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Author
                    </Label>
                    <Input
                      id="author"
                      type="text"
                      data-testid="select-author"
                      value={author}
                      onChange={handleAuthorChange}
                      placeholder="e.g. F. Scott Fitzgerald"
                      className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
                    />
                    {errors.author && (
                      <p data-testid="error-author" className="text-xs text-destructive font-medium">
                        {errors.author}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pages" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Pages
                    </Label>
                    <Input
                      id="pages"
                      type="number"
                      data-testid="input-pages"
                      value={pages}
                      onChange={handlePagesChange}
                      placeholder="e.g. 320"
                      className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
                    />
                    {errors.pages && (
                      <p data-testid="error-pages" className="text-xs text-destructive font-medium">
                        {errors.pages}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                      Status
                    </Label>
                    <select
                      id="status"
                      data-testid="select-status"
                      value={status}
                      onChange={handleStatusChange}
                      className="flex h-11 w-full rounded-xl border border-[#d8e5cd] bg-white px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2d5a37]"
                    >
                      <option value="">Choose status</option>
                      {STATUS_CHOICES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p data-testid="error-status" className="text-xs text-destructive font-medium">
                        {errors.status}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    data-testid="btn-add-book"
                    className="w-full h-11 rounded-full bg-[#2d5a37] text-white hover:bg-[#204028] font-bold shadow-md mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Book'}
                  </Button>
                </CardContent>
              </form>
            </Card>

            {/* Filter Section */}
            <Card className="rounded-[2rem] border-[#e3ebd9] bg-white shadow-sm p-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#1c2e22]">
                  <RotateCcw className="w-5 h-5 text-[#2d5a37]" /> Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-status" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                    Filter Status
                  </Label>
                  <select
                    id="filter-status"
                    data-testid="filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-[#d8e5cd] bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2d5a37]"
                  >
                    <option value="">All</option>
                    {STATUS_CHOICES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="search-input" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                    Search Title or Author
                  </Label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-[#5a705e]" />
                    <Input
                      id="search-input"
                      type="text"
                      data-testid="search-input"
                      search-books=""
                      placeholder="Type title or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 rounded-xl border-[#d8e5cd] pl-9 focus-visible:ring-[#2d5a37]"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  data-testid="btn-clear-filters"
                  onClick={handleClearFilters}
                  className="w-full h-11 rounded-full border-[#d8e5cd] text-[#2d5a37] hover:bg-[#e9f2e4] font-semibold"
                >
                  Clear
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary & The List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card className="rounded-[2rem] border-[#e3ebd9] bg-[#e9f2e4]/70 shadow-sm p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-[#2d5a37] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2d5a37]" /> Shelf Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#d8e5cd] flex flex-col justify-between">
                    <span className="text-xs font-bold text-[#5a705e] uppercase tracking-wider">
                      Total Books
                    </span>
                    <p data-testid="book-count" className="text-2xl sm:text-3xl font-black text-[#2d5a37] mt-1">
                      {bookCount}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#d8e5cd] flex flex-col justify-between">
                    <span className="text-xs font-bold text-[#5a705e] uppercase tracking-wider">
                      Total Pages
                    </span>
                    <p data-testid="total-pages" className="text-2xl sm:text-3xl font-black text-[#1c2e22] mt-1">
                      {totalPages}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#d8e5cd]">
                  <h4 className="text-xs font-bold text-[#5a705e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#2d5a37]" /> Status Breakdown
                  </h4>
                  <div data-testid="status-breakdown" className="space-y-2.5">
                    {breakdown.length === 0 ? (
                      <p className="text-xs text-[#5a705e] italic">No status data to display</p>
                    ) : (
                      breakdown.map((row) => (
                        <div
                          key={row.status}
                          data-testid="breakdown-row"
                          className="flex justify-between items-center text-sm py-1.5 border-b border-[#f0f4ea] last:border-0"
                        >
                          <span data-testid="breakdown-name" className="font-semibold text-[#1c2e22]">
                            {row.status}
                          </span>
                          <span
                            data-testid="breakdown-amount"
                            breakdown-count=""
                            className="font-bold text-[#2d5a37]"
                          >
                            {row.count}
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
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#1c2e22] flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-[#2d5a37]" /> Your Shelf
                </CardTitle>
                <span className="text-xs font-semibold px-3 py-1 bg-[#e9f2e4] text-[#2d5a37] rounded-full">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'}
                </span>
              </CardHeader>
              <CardContent>
                {filteredBooks.length === 0 ? (
                  <div
                    data-testid="books-empty"
                    book-empty=""
                    className="text-center py-12 text-[#5a705e] text-sm"
                  >
                    No books found
                  </div>
                ) : (
                  <div data-testid="book-list" className="space-y-3">
                    {filteredBooks.map((item) => (
                      <div
                        key={item.id}
                        data-testid="book-item"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#e3ebd9] bg-[#fbfbf7] hover:bg-[#f4f7ef] transition-colors gap-3"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 data-testid="book-title" className="font-bold text-base text-[#1c2e22]">
                              {item.title}
                            </h3>
                            <span
                              data-testid="book-status"
                              className={`font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs ${
                                item.status === 'Finished'
                                  ? 'bg-[#2d5a37] text-white'
                                  : item.status === 'Reading'
                                  ? 'bg-[#d8e8ce] text-[#204028]'
                                  : 'bg-[#e9f2e4] text-[#5a705e]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#5a705e]">
                            <span>
                              By <strong data-testid="book-author" className="text-[#1c2e22]">{item.author}</strong>
                            </span>
                            <span>•</span>
                            <span data-testid="book-pages" className="font-semibold">
                              {item.pages} pages
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {item.status !== 'Finished' && (
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid="btn-advance-book"
                              onClick={() => handleAdvance(item.id)}
                              className="rounded-full border-[#d8e5cd] text-[#2d5a37] hover:bg-[#e9f2e4] text-xs font-semibold"
                            >
                              Advance <ArrowRightCircle className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid="btn-delete-book"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-full text-destructive hover:bg-destructive/10 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </Button>
                        </div>
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
