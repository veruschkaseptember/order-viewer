'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FilterChip {
  label: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFiltersChipsProps {
  filters: FilterChip[];
  onClearAll: () => void;
  className?: string;
}

export function ActiveFiltersChips({
  filters,
  onClearAll,
  className = '',
}: ActiveFiltersChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground">Active filters:</span>
      {filters.map((filter, index) => (
        <Badge
          key={`${filter.label}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 pr-1">
          <span className="text-xs">
            {filter.label}: {filter.value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={filter.onRemove}>
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      ))}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
          Clear all
        </Button>
      )}
    </div>
  );
}
