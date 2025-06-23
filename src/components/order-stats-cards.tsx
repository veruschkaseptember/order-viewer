/**
 * Order Statistics Cards - Live statistics widget
 * Shows total orders, total revenue, paid orders percentage, and unpaid orders
 * Updates in real-time based on current filters
 */

'use client';

import {
  IconTrendingDown,
  IconTrendingUp,
  IconCircleDashed,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

// Types for stats data structure (matching our API response)
interface OrderStats {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  statusBreakdown: Array<{
    status: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';
    count: number;
    revenue: number;
  }>;
  paymentStatus: {
    paid: {
      count: number;
      revenue: number;
    };
    unpaid: {
      count: number;
      revenue: number;
    };
  };
}

interface OrderStatsCardsProps {
  data?: OrderStats;
  isLoading?: boolean;
}

/**
 * OrderStatsCards Component
 *
 * Displays real-time order statistics in a grid layout with proper loading states
 * and accessibility features. Shows total orders, revenue, payment status, and unpaid orders.
 *
 * @param data - Order statistics data from API
 * @param isLoading - Loading state indicator
 * @returns JSX element with stats cards or loading skeletons
 */
export function OrderStatsCards({ data, isLoading }: OrderStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4"
        role="region"
        aria-label="Loading order statistics"
        aria-live="polite">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs"
            role="status"
            aria-label="Loading statistics card">
            <CardHeader>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4"
        role="region"
        aria-label="Order statistics"
        aria-live="polite">
        <div
          className="col-span-full text-center text-muted-foreground py-8"
          role="status"
          aria-label="No statistics available">
          No statistics available
        </div>
      </div>
    );
  }
  const { overview, paymentStatus } = data;
  const paidPercentage =
    overview?.totalOrders > 0
      ? Math.round((paymentStatus?.paid?.count / overview.totalOrders) * 100)
      : 0;
  const unpaidCount = paymentStatus?.unpaid?.count || 0;

  return (
    <div
      className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Order statistics"
      aria-live="polite">
      {' '}
      {/* Total Orders */}
      <Card
        className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs"
        role="img"
        aria-label={`Total orders: ${
          overview?.totalOrders?.toLocaleString() || '0'
        }`}>
        <CardHeader>
          <CardDescription id="total-orders-desc">Total Orders</CardDescription>
          <CardTitle
            className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
            aria-describedby="total-orders-desc">
            {overview?.totalOrders?.toLocaleString() || '0'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" aria-label="Active status indicator">
              <IconTrendingUp aria-hidden="true" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Current filtered results <IconCircleDashed className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Orders matching your filters
          </div>
        </CardFooter>
      </Card>{' '}
      {/* Total Revenue */}
      <Card
        className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs"
        role="img"
        aria-label={`Total revenue: ${formatCurrency(
          overview?.totalRevenue || 0
        )}`}>
        <CardHeader>
          <CardDescription id="total-revenue-desc">
            Total Revenue
          </CardDescription>
          <CardTitle
            className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
            aria-describedby="total-revenue-desc">
            {formatCurrency(overview?.totalRevenue || 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" aria-label="Revenue growth indicator">
              <IconTrendingUp aria-hidden="true" />
              +Revenue
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Gross revenue from orders{' '}
            <IconCurrencyDollar className="size-4" aria-hidden="true" />
          </div>
          <div className="text-muted-foreground">Before fees and taxes</div>
        </CardFooter>
      </Card>{' '}
      {/* Paid Orders */}
      <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>Paid Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {paidPercentage}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {paidPercentage >= 80 ? <IconTrendingUp /> : <IconTrendingDown />}
              {paidPercentage >= 80 ? 'Excellent' : 'Needs attention'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {paidPercentage >= 80
              ? 'Strong payment rate'
              : 'Payment follow-up needed'}
            {paidPercentage >= 80 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>{' '}
          <div className="text-muted-foreground">
            {paymentStatus?.paid?.count || 0} of {overview?.totalOrders || 0}{' '}
            orders paid
          </div>
        </CardFooter>
      </Card>{' '}
      {/* Unpaid Orders */}
      <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>Unpaid Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {unpaidCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {unpaidCount > 5 ? <IconTrendingUp /> : <IconTrendingDown />}
              {unpaidCount > 5 ? 'High' : 'Low'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {unpaidCount > 5 ? 'Follow up required' : 'Good payment compliance'}
            <IconCircleDashed className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Outstanding payment collection
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
