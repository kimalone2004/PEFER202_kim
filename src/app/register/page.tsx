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
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        </CardHeader>
        <form data-testid="register-form" noValidate onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <div data-testid="form-success" className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                Registration successful
              </div>
            )}

            {errors.auth && (
              <div data-testid="error-auth" className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {errors.auth}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="register-email"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@example.com"
              />
              {errors.email && (
                <p data-testid="error-email" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="register-password"
                value={password}
                onChange={handlePasswordChange}
              />
              {errors.password && (
                <p data-testid="error-password" className="text-xs text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {errors.confirmPassword && (
                <p data-testid="error-confirm-password" className="text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

