'use client';

import * as React from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useId } from 'react';
import { useUpdatePaymentStatus } from '@/hooks/use-orders';
import { OrderDetailsPanel } from '@/components/OrderDetailsDrawer';
import { formatCurrency } from '@/lib/utils';
import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconGripVertical,
} from '@tabler/icons-react';
import { CheckIcon } from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type OrderRow = {
  id: number;
  orderId: string;
  customerName: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';
  total: string;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
};

function DragHandle() {
  return (
    <Button
      variant="ghost"
      className="flex size-8 items-center justify-center p-0 text-muted-foreground"
      size="icon">
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function MarkAsPaidBadge({
  paid,
  onToggle,
  orderId,
}: {
  paid: boolean;
  onToggle: () => void;
  orderId: string;
}) {
  const id = useId();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <Badge
      className="has-data-[state=unchecked]:bg-muted has-data-[state=unchecked]:text-muted-foreground has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative outline-none has-focus-visible:ring-[3px] cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={onToggle}
      aria-label={`${
        paid ? 'Mark as unpaid' : 'Mark as paid'
      } for order ${orderId}`}
      aria-pressed={paid}>
      <Checkbox
        id={id}
        className="peer sr-only after:absolute after:inset-0"
        checked={paid}
        onCheckedChange={onToggle}
        aria-hidden="true"
        tabIndex={-1}
      />
      <CheckIcon
        size={12}
        className="hidden peer-data-[state=checked]:block"
        aria-hidden="true"
      />
      <span className="cursor-pointer select-none">
        {paid ? 'Paid' : 'Mark as Paid'}
      </span>

      {/* Screen reader status */}
      <span className="sr-only">
        Order {orderId} is currently {paid ? 'paid' : 'unpaid'}. Press Enter or
        Space to {paid ? 'mark as unpaid' : 'mark as paid'}.
      </span>
    </Badge>
  );
}

function DraggableRow({ row }: { row: Row<OrderRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      role="row"
      aria-rowindex={row.index + 2} // +2 because header is row 1, and we're 0-indexed
      aria-selected={row.getIsSelected()}
      aria-label={`Order ${row.original.orderId} for ${row.original.customerName}`}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} role="gridcell">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

function PaymentCell({
  row,
  onTogglePayment,
}: {
  row: Row<OrderRow>;
  onTogglePayment: (orderId: string, currentStatus: boolean) => void;
}) {
  return (
    <MarkAsPaidBadge
      paid={row.original.paid}
      orderId={row.original.orderId}
      onToggle={() => {
        onTogglePayment(row.original.orderId, row.original.paid);
      }}
    />
  );
}

export function DataTable({ data: initialData }: { data: OrderRow[] }) {
  // Minimal defensive programming: ensure we have valid data
  const safeInitialData = Array.isArray(initialData) ? initialData : [];
  const [data, setData] = React.useState(() => safeInitialData);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(
    null
  );

  // Update local data when initialData changes (from TanStack Query updates)
  React.useEffect(() => {
    const safeData = Array.isArray(initialData) ? initialData : [];
    setData(safeData);
  }, [initialData]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Payment toggle mutation with optimistic updates
  const { mutate: updatePayment } = useUpdatePaymentStatus();

  // Function to handle payment toggle with optimistic update
  const handlePaymentToggle = React.useCallback(
    (orderId: string, currentStatus: boolean) => {
      const newPaidStatus = !currentStatus; // Toggle the current status

      // Optimistic update - immediately update the UI
      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderId ? { ...order, paid: newPaidStatus } : order
        )
      );

      // Then make the API call
      updatePayment({
        orderId,
        paid: newPaidStatus,
      });
    },
    [updatePayment]
  );

  // Create columns inside component to access togglePayment function
  const columns: ColumnDef<OrderRow>[] = React.useMemo(
    () => [
      {
        id: 'drag',
        header: () => null,
        cell: () => <DragHandle />,
      },
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table?.getIsAllPageRowsSelected() ||
                (table?.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) =>
                table?.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'orderId',
        header: 'Order ID',
        cell: ({ row }) => {
          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedOrderId(row.original.orderId);
            }
          };

          return (
            <button
              type="button"
              className="font-medium text-foreground hover:text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              onClick={() => setSelectedOrderId(row.original.orderId)}
              onKeyDown={handleKeyDown}
              aria-label={`View details for order ${row.original.orderId}`}
              aria-describedby={`order-${row.original.id}-customer`}>
              {row.original.orderId}
            </button>
          );
        },
        enableHiding: false,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <div
            className="w-48"
            id={`order-${row.original.id}-customer`}
            aria-label={`Customer: ${row.original.customerName}`}>
            {row.original.customerName}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors = {
            Shipped: 'bg-green-50 text-green-700 border-green-200',
            Processing: 'bg-blue-50 text-blue-700 border-blue-200',
            Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            Cancelled: 'bg-red-50 text-red-700 border-red-200',
          };

          return (
            <Badge
              variant="outline"
              className={`text-muted-foreground px-1.5 ${
                statusColors[status] || ''
              }`}
              role="status"
              aria-label={`Order status: ${status}`}>
              {status === 'Shipped' && (
                <IconCircleCheckFilled
                  className="fill-green-500 dark:fill-green-400 mr-1"
                  size={12}
                  aria-hidden="true"
                />
              )}
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => {
          const amount = parseFloat(row.original.total);
          const formattedAmount = formatCurrency(amount);
          return (
            <div
              className="font-medium"
              aria-label={`Order total: ${formattedAmount}`}>
              {formattedAmount}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          const formattedDate = date.toLocaleDateString();
          return (
            <div
              className="text-muted-foreground"
              aria-label={`Created on ${date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`}>
              {formattedDate}
            </div>
          );
        },
      },
      {
        accessorKey: 'paid',
        header: 'Payment',
        cell: ({ row }) => (
          <PaymentCell row={row} onTogglePayment={handlePaymentToggle} />
        ),
      },
    ],
    [handlePaymentToggle, setSelectedOrderId]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds: UniqueIdentifier[] = React.useMemo(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }
  return (
    <>
      <div
        className="rounded-md border"
        role="region"
        aria-label="Orders table">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}>
          <Table role="table" aria-label="Orders data">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} role="row">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        role="columnheader"
                        aria-sort={
                          header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : header.column.getIsSorted() === 'desc'
                            ? 'descending'
                            : header.column.getCanSort()
                            ? 'none'
                            : undefined
                        }>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody role="rowgroup">
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows?.length ? (
                  table
                    .getRowModel()
                    .rows.map((row) => <DraggableRow key={row.id} row={row} />)
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>{' '}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table?.getFilteredSelectedRowModel()?.rows?.length || 0} of{' '}
          {table?.getFilteredRowModel()?.rows?.length || 0} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table?.getState()?.pagination?.pageSize || 10}`}
              onValueChange={(value) => {
                table?.setPageSize(Number(value));
              }}>
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table?.getState()?.pagination?.pageSize || 10}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {(table?.getState()?.pagination?.pageIndex || 0) + 1} of{' '}
            {table?.getPageCount() || 1}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table?.setPageIndex(0)}
              disabled={!table?.getCanPreviousPage()}>
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table?.previousPage()}
              disabled={!table?.getCanPreviousPage()}>
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Order Details Panel */}
      <OrderDetailsPanel
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  );
}
