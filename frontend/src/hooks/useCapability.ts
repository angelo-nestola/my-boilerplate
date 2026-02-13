'use client';

import { useAuth } from '@/features/auth';

export function useCapability(code: string): boolean {
  const { user } = useAuth();
  return user?.capabilities?.includes(code) ?? false;
}

export function useAnyCapability(...codes: string[]): boolean {
  const { user } = useAuth();
  if (!user?.capabilities) return false;
  return codes.some((code) => user.capabilities.includes(code));
}

export function useAllCapabilities(...codes: string[]): boolean {
  const { user } = useAuth();
  if (!user?.capabilities) return false;
  return codes.every((code) => user.capabilities.includes(code));
}
