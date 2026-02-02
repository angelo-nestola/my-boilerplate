'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Typography, Box, Link as MuiLink } from '@mui/material';
import { LoginForm } from '@/components/auth';
import { useAuth, type LoginRequest } from '@/features/auth';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: LoginRequest) => {
    try {
      setError(null);
      await login(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
        Sign In
      </Typography>

      <Box sx={{ width: '100%' }}>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don&apos;t have an account?{' '}
            <MuiLink component={Link} href={ROUTES.REGISTER}>
              Sign Up
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </>
  );
}
