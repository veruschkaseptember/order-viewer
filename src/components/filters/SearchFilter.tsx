'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useId } from 'react';

interface SearchFilterProps {
  value?: string;
  onChange: (value?: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function SearchFilter({
  value = '',
  onChange,
  placeholder = 'Search by customer name or order ID...',
  className = 'min-w-64',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: SearchFilterProps) {
  const searchId = useId();
  const helpTextId = useId();
  const clearButtonId = useId();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape key clears the search
    if (e.key === 'Escape') {
      onChange(undefined);
      e.currentTarget.blur();
    }
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const hasValue = value && value.trim().length > 0;

  return (
    <div className={`relative ${className}`} role="search">
      <SearchIcon
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        id={searchId}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value || undefined)}
        onKeyDown={handleKeyDown}
        className={`pl-10 ${hasValue ? 'pr-10' : ''}`}
        aria-label={ariaLabel || 'Search orders'}
        aria-describedby={`${helpTextId} ${ariaDescribedBy || ''}`.trim()}
        autoComplete="off"
      />

      {/* Clear button - only shown when there's a value */}
      {hasValue && (
        <Button
          id={clearButtonId}
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-sm p-0 hover:bg-muted"
          onClick={handleClear}
          aria-label={`Clear search: ${value}`}
          tabIndex={0}>
          <XIcon className="h-3 w-3" aria-hidden="true" />
        </Button>
      )}

      {/* Screen reader help text */}
      <div id={helpTextId} className="sr-only">
        Search by customer name or order ID. Press Escape to clear search.
      </div>
    </div>
  );
}
