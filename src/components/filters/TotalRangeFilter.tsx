'use client';

import { DollarSignIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TotalRangeFilterProps {
  minTotal?: number;
  maxTotal?: number;
  onMinTotalChange: (value?: number) => void;
  onMaxTotalChange: (value?: number) => void;
  className?: string;
}

export function TotalRangeFilter({
  minTotal,
  maxTotal,
  onMinTotalChange,
  onMaxTotalChange,
  className = '',
}: TotalRangeFilterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <Label htmlFor="min-total" className="text-xs text-muted-foreground">
          Min Total
        </Label>
        <Input
          id="min-total"
          type="number"
          placeholder="0"
          value={minTotal || ''}
          onChange={(e) => {
            const value = e.target.value;
            onMinTotalChange(value ? parseFloat(value) : undefined);
          }}
          className="w-24"
        />
      </div>
      <span className="text-muted-foreground mt-5">-</span>
      <div className="flex flex-col gap-1">
        <Label htmlFor="max-total" className="text-xs text-muted-foreground">
          Max Total
        </Label>
        <Input
          id="max-total"
          type="number"
          placeholder="∞"
          value={maxTotal || ''}
          onChange={(e) => {
            const value = e.target.value;
            onMaxTotalChange(value ? parseFloat(value) : undefined);
          }}
          className="w-24"
        />
      </div>
    </div>
  );
}
