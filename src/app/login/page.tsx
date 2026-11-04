'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { provider } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ email?: string; password?: string; auth?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (emailVal: string, passwordVal: string) => {
    const newErrors: { email?: string; password?: string } = {};

    if (!emailVal.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!passwordVal) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (submitted) {
      const errs = validate(val, password);
      setErrors((prev) => ({ ...prev, email: errs.email, auth: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (submitted) {
      const errs = validate(email, val);
      setErrors((prev) => ({ ...prev, password: errs.password, auth: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(email, password);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (provider === 'firebase' && auth) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      router.push('/expenses');
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, auth: err.message || 'Authentication failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-6 bg-[#fbfbf7]">
      <Card className="w-full max-w-md rounded-[2rem] border-[#e3ebd9] bg-white shadow-lg p-3">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#2d5a37] text-white flex items-center justify-center shadow-sm">
            <Leaf className="w-6 h-6 fill-current" />
          </div>
          <CardTitle className="text-2xl font-black text-[#1c2e22]">Welcome Back</CardTitle>
          <p className="text-sm text-[#5a705e]">Sign in to manage your mindful spending</p>
        </CardHeader>
        <form data-testid="login-form" noValidate onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.auth && (
              <div data-testid="error-auth" className="p-3 text-sm text-destructive bg-destructive/10 rounded-2xl">
                {errors.auth}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                data-testid="login-email"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@example.com"
                className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
              />
              {errors.email && (
                <p data-testid="error-email" className="text-xs text-destructive font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                data-testid="login-password"
                value={password}
                onChange={handlePasswordChange}
                className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
              />
              {errors.password && (
                <p data-testid="error-password" className="text-xs text-destructive font-medium">
                  {errors.password}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full h-11 rounded-full bg-[#2d5a37] text-white hover:bg-[#204028] font-bold shadow-md"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
            <p className="text-sm text-[#5a705e] text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-[#2d5a37] hover:underline">
                Register now
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
