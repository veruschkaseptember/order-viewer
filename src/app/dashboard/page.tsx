'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { SiteHeader } from '@/components/site-header';
import { FilterPanel } from '@/components/filters';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useOrders, useOrderStats } from '@/hooks/use-orders';
import { useURLFilters } from '@/hooks/use-url-filters';
import { OrderStatsCards } from '@/components/order-stats-cards';

export default function Dashboard() {
  // Get URL-based filters with debouncing
  const { toDebouncedOrderFilters } = useURLFilters();

  // Create filter object for API calls (use debounced filters)
  const filterParams = toDebouncedOrderFilters({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  // Fetch live order data from database with filters
  const { data: ordersData, error: ordersError } = useOrders(filterParams);
  // Fetch live order statistics with same filters as orders table
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useOrderStats(filterParams); // Transform API response to match DataTable schema (memoized for performance)
  const transformedOrders = useMemo(
    () =>
      ordersData?.orders?.map((order) => ({
        id: order.id,
        orderId: order.orderId,
        customerName: order.customerName,
        status: order.status,
        total: order.total,
        paid: order.paid,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })) || [],
    [ordersData?.orders]
  );

  // Simple error handling
  if (ordersError || statsError) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <SiteHeader />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    Unable to load dashboard
                  </h2>{' '}
                  <p className="text-muted-foreground">
                    {ordersError?.message ??
                      statsError?.message ??
                      'An error occurred'}
                  </p>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SiteHeader />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              {/* Stats Cards */}
              <div className="p-4">
                <OrderStatsCards data={statsData} isLoading={statsLoading} />
              </div>
              {/* Filter Panel */}
              <FilterPanel /> {/* Orders Table */}
              <div className="px-4 pb-4 pt-6">
                <DataTable data={transformedOrders} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
