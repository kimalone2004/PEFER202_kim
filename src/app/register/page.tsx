'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function RegisterPage() {
  const { provider } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    auth?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (emailVal: string, passwordVal: string, confirmPasswordVal: string) => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!emailVal.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!passwordVal) {
      newErrors.password = 'Password is required';
    } else if (passwordVal.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPasswordVal) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (confirmPasswordVal !== passwordVal) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (submitted) {
      const errs = validate(val, password, confirmPassword);
      setErrors((prev) => ({ ...prev, email: errs.email, auth: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (submitted) {
      const errs = validate(email, val, confirmPassword);
      setErrors((prev) => ({ ...prev, password: errs.password, confirmPassword: errs.confirmPassword, auth: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (submitted) {
      const errs = validate(email, password, val);
      setErrors((prev) => ({ ...prev, confirmPassword: errs.confirmPassword, auth: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(email, password, confirmPassword);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setSuccess(false);
    try {
      if (provider === 'firebase' && auth) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSubmitted(false);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, auth: err.message || 'Registration failed' }));
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
          <CardTitle className="text-2xl font-black text-[#1c2e22]">Create Account</CardTitle>
          <p className="text-sm text-[#5a705e]">Start your eco-friendly budget journey today</p>
        </CardHeader>
        <form data-testid="register-form" noValidate onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <div data-testid="form-success" className="p-3 text-sm text-[#204028] bg-[#e9f2e4] border border-[#c5dbb8] rounded-2xl font-semibold">
                Registration successful
              </div>
            )}

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
                data-testid="register-email"
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
                data-testid="register-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-[#5a705e]">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="h-11 rounded-xl border-[#d8e5cd] focus-visible:ring-[#2d5a37]"
              />
              {errors.confirmPassword && (
                <p data-testid="error-confirm-password" className="text-xs text-destructive font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full h-11 rounded-full bg-[#2d5a37] text-white hover:bg-[#204028] font-bold shadow-md"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <p className="text-sm text-[#5a705e] text-center">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#2d5a37] hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
