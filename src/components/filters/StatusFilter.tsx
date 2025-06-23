'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StatusFilterProps {
  readonly value?: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';
  readonly onChange: (
    value?: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled'
  ) => void;
  readonly className?: string;
}

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Cancelled',
] as const;

export function StatusFilter({
  value,
  onChange,
  className = '',
}: StatusFilterProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label htmlFor="status-filter" className="text-xs text-muted-foreground">
        Status
      </Label>{' '}
      <Select
        value={value ?? 'all'}
        onValueChange={(val) =>
          onChange(val === 'all' ? undefined : (val as typeof value))
        }>
        <SelectTrigger id="status-filter" className="w-36">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
