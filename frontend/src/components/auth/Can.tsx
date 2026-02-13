'use client';

import { type ReactNode } from 'react';
import { useCapability } from '@/hooks/useCapability';

interface CanProps {
  capability: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ capability, children, fallback }: CanProps) {
  const hasCapability = useCapability(capability);
  return hasCapability ? <>{children}</> : (fallback ?? null);
}
