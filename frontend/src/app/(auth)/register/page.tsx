'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Typography, Box, Link as MuiLink } from '@mui/material';
import { RegisterForm } from '@/components/auth';
import { useAuth, type RegisterRequest } from '@/features/auth';
import { ROUTES } from '@/lib/constants';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RegisterRequest) => {
    try {
      setError(null);
      await register(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
        Create Account
      </Typography>

      <Box sx={{ width: '100%' }}>
        <RegisterForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <MuiLink component={Link} href={ROUTES.LOGIN}>
              Sign In
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </>
  );
}
