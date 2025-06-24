import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', ...props }) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
  const variants = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-gray-300 text-gray-700',
  };
  return <span className={cn(base, variants[variant], className)} {...props} />;
}
