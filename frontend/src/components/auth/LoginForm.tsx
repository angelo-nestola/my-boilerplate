'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import type { LoginRequest } from '@/features/auth';

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState(process.env.NODE_ENV === 'development' ? 'admin@riskplatform.com' : '');
  const [password, setPassword] = useState(process.env.NODE_ENV === 'development' ? 'Admin123!' : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading || !email || !password}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
    </Box>
  );
}
