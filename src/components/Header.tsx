'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sparkles, Leaf } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fbfbf7]/90 backdrop-blur-md border-b border-[#e3ebd9]">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 max-w-6xl">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#2d5a37]">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2d5a37] text-white shadow-sm">
            <Leaf className="w-5 h-5 fill-current" />
          </span>
          <span>SpendWise</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/expenses"
                data-testid="link-expenses"
                className="text-sm font-semibold text-[#2d5a37] hover:bg-[#e9f2e4] px-4 py-2 rounded-full transition-colors"
              >
                Expenses
              </Link>
              <span
                data-testid="user-email"
                className="text-xs font-medium text-[#5a705e] bg-[#e9f2e4] px-3 py-1.5 rounded-full hidden sm:inline-block"
              >
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-logout"
                onClick={handleLogout}
                className="rounded-full border-[#d8e5cd] text-[#2d5a37] hover:bg-[#e9f2e4] hover:text-[#2d5a37]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="btn-login"
                  className="rounded-full text-[#2d5a37] hover:bg-[#e9f2e4] px-5"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  data-testid="btn-register"
                  className="rounded-full bg-[#2d5a37] text-white hover:bg-[#23472c] px-6 shadow-sm"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
