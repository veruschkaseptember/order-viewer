'use client';

import React, { useState } from 'react';
import { FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useDebounce } from 'use-debounce';

import { useURLFilters } from '@/hooks/use-url-filters';
import { SimpleSearchFilter } from './SimpleSearchFilter';
import { StatusFilter } from './StatusFilter';
import { PaidStatusFilter } from './PaidStatusFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { ActiveFiltersChips } from './ActiveFiltersChips';

export function FilterPanel() {
  const {
    urlFilters,
    updateURLFilters,
    clearURLFilters,
    hasActiveFilters,
    isPending,
  } = useURLFilters();

  const [isExpanded, setIsExpanded] = useState(hasActiveFilters);

  // Local search state with debouncing - prevents typing issues
  const [searchValue, setSearchValue] = useState(urlFilters.search || '');
  const [debouncedSearch] = useDebounce(searchValue, 300);

  // Update URL when debounced search changes
  React.useEffect(() => {
    updateURLFilters({ search: debouncedSearch || undefined });
  }, [debouncedSearch, updateURLFilters]);

  // Helper function to format filter values for display
  const getActiveFilterChips = () => {
    const chips = [];

    if (urlFilters.search) {
      chips.push({
        label: 'Search',
        value: urlFilters.search,
        onRemove: () => {
          setSearchValue('');
          updateURLFilters({ search: undefined });
        },
      });
    }

    if (urlFilters.status) {
      chips.push({
        label: 'Status',
        value: urlFilters.status,
        onRemove: () => updateURLFilters({ status: undefined }),
      });
    }

    if (urlFilters.paid !== undefined) {
      chips.push({
        label: 'Payment',
        value: urlFilters.paid ? 'Paid' : 'Unpaid',
        onRemove: () => updateURLFilters({ paid: undefined }),
      });
    }

    if (urlFilters.dateFrom) {
      chips.push({
        label: 'From',
        value: new Date(urlFilters.dateFrom).toLocaleDateString(),
        onRemove: () => updateURLFilters({ dateFrom: undefined }),
      });
    }

    if (urlFilters.dateTo) {
      chips.push({
        label: 'To',
        value: new Date(urlFilters.dateTo).toLocaleDateString(),
        onRemove: () => updateURLFilters({ dateTo: undefined }),
      });
    }

    return chips;
  };

  const handleClearAll = () => {
    setSearchValue('');
    clearURLFilters();
  };
  return (
    <div
      className="border-b bg-muted/40 p-4"
      role="search"
      aria-label="Order filters">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 font-medium"
              aria-expanded={isExpanded}
              aria-controls="filter-content"
              aria-label={`${
                isExpanded ? 'Collapse' : 'Expand'
              } filter options`}>
              <FilterIcon className="h-4 w-4" aria-hidden="true" />
              Filters
              {hasActiveFilters && (
                <span
                  className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                  aria-label={`${
                    getActiveFilterChips().length
                  } active filters`}>
                  {getActiveFilterChips().length}
                </span>
              )}
            </Button>
          </CollapsibleTrigger>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear all active filters">
              Clear all
            </Button>
          )}
        </div>
        <CollapsibleContent
          id="filter-content"
          className="space-y-4 pt-4"
          aria-label="Filter options">
          <fieldset className="space-y-4">
            <legend className="sr-only">
              Filter orders by various criteria
            </legend>
            {/* Primary filters row */}
            <div
              className="flex flex-wrap items-end gap-4"
              role="group"
              aria-label="Primary filters">
              <SimpleSearchFilter
                value={searchValue}
                onChange={setSearchValue}
                aria-label="Search orders by customer name or order ID"
              />

              <StatusFilter
                value={urlFilters.status}
                onChange={(value) => updateURLFilters({ status: value })}
                aria-label="Filter by order status"
              />

              <PaidStatusFilter
                value={urlFilters.paid}
                onChange={(value) => updateURLFilters({ paid: value })}
                aria-label="Filter by payment status"
              />
            </div>
            {/* Secondary filters row */}
            <div
              className="flex flex-wrap items-end gap-6"
              role="group"
              aria-label="Date and amount filters">
              <DateRangeFilter
                startDate={urlFilters.dateFrom}
                endDate={urlFilters.dateTo}
                onStartDateChange={(value) =>
                  updateURLFilters({ dateFrom: value })
                }
                onEndDateChange={(value) => updateURLFilters({ dateTo: value })}
                aria-label="Filter by date range"
              />
            </div>
          </fieldset>
        </CollapsibleContent>
      </Collapsible>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <ActiveFiltersChips
          filters={getActiveFilterChips()}
          onClearAll={handleClearAll}
          className="mt-3"
        />
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="mt-2 text-xs text-muted-foreground">
          Updating filters...
        </div>
      )}
    </div>
  );
}
