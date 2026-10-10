import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <div
      role="status"
      className={cn('flex items-center justify-center text-primary', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizeMap[size])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
