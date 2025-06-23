'use client';

import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SimpleSearchFilterProps {
  readonly value?: string;
  readonly onChange: (value?: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

export function SimpleSearchFilter({
  value = '',
  onChange,
  placeholder = 'Search by customer name or order ID...',
  className = 'min-w-64',
}: SimpleSearchFilterProps) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value ?? undefined)}
        className="pl-10"
      />
    </div>
  );
}
