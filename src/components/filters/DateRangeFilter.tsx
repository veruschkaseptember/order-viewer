'use client';

import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateRangeFilterProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (value?: string) => void;
  onEndDateChange: (value?: string) => void;
  className?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = '',
}: DateRangeFilterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <Label htmlFor="start-date" className="text-xs text-muted-foreground">
          From Date
        </Label>{' '}
        <Input
          id="start-date"
          type="date"
          value={startDate ?? ''}
          onChange={(e) => onStartDateChange(e.target.value ?? undefined)}
          className="w-36"
        />
      </div>
      <span className="text-muted-foreground mt-5">-</span>
      <div className="flex flex-col gap-1">
        <Label htmlFor="end-date" className="text-xs text-muted-foreground">
          To Date
        </Label>{' '}
        <Input
          id="end-date"
          type="date"
          value={endDate ?? ''}
          onChange={(e) => onEndDateChange(e.target.value ?? undefined)}
          className="w-36"
        />
      </div>
    </div>
  );
}
