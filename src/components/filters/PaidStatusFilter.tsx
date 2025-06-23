'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PaidStatusFilterProps {
  value?: boolean;
  onChange: (value?: boolean) => void;
  className?: string;
}

export function PaidStatusFilter({
  value,
  onChange,
  className = '',
}: PaidStatusFilterProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label htmlFor="paid-filter" className="text-xs text-muted-foreground">
        Payment
      </Label>
      <Select
        value={value === undefined ? 'all' : value ? 'paid' : 'unpaid'}
        onValueChange={(val) => {
          if (val === 'all') onChange(undefined);
          else onChange(val === 'paid');
        }}>
        <SelectTrigger id="paid-filter" className="w-36">
          <SelectValue placeholder="All Payment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
