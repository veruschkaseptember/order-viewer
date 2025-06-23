'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, type OrderFilters, type OrdersResponse } from '@/lib/api-client'
import { toast } from 'sonner'

export const orderQueryKeys = {
  all: ['orders'] as const,
  lists: () => [...orderQueryKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderQueryKeys.lists(), filters] as const,
  details: () => [...orderQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderQueryKeys.details(), id] as const,
  stats: () => [...orderQueryKeys.all, 'stats'] as const,
  stat: (filters: Omit<OrderFilters, 'page' | 'limit' | 'sortBy' | 'sortOrder'>) =>
    [...orderQueryKeys.stats(), filters] as const,
}

// Hook for fetching orders with filtering and pagination
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: orderQueryKeys.list(filters),
    queryFn: async () => {
      const response = await ordersApi.getOrders(filters)
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to fetch orders')
      }
      return response.data!
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always'
  })
}

// Hook for fetching order statistics
export function useOrderStats(filters: Omit<OrderFilters, 'page' | 'limit' | 'sortBy' | 'sortOrder'> = {}) {
  return useQuery({
    queryKey: orderQueryKeys.stat(filters),
    queryFn: async () => {
      const response = await ordersApi.getOrderStats(filters)
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to fetch order statistics')
      }
      return response.data!
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 // Refresh every minute for live stats
  })
}

// Hook for fetching individual order details
export function useOrderDetails(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: orderQueryKeys.detail(id),
    queryFn: async () => {
      const response = await ordersApi.getOrderDetails(id)
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to fetch order details')
      }
      return response.data!
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  })
}

// Hook for updating payment status
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, paid }: { orderId: string; paid: boolean }) => {
      const response = await ordersApi.updatePaymentStatus(orderId, paid)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update payment status')
      }
      return response.data!
    },
    // Optimistic update
    onMutate: async ({ orderId, paid }) => {
      await queryClient.cancelQueries({ queryKey: orderQueryKeys.all })

      // Snapshot the previous value for rollback
      const previousOrdersData = queryClient.getQueriesData({ queryKey: orderQueryKeys.lists() })

      // Optimistically update to the new value
      queryClient.setQueriesData(
        { queryKey: orderQueryKeys.lists() },
        (oldData: OrdersResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              orders: oldData.orders.map(order =>
                order.orderId === orderId
                  ? { ...order, paid, updatedAt: new Date().toISOString() }
                  : order
              )
            }
          }
          return oldData
        }
      )

      // Return a context object with the snapshotted value
      return { previousOrdersData }
    },    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, variables, context) => {
      if (context?.previousOrdersData) {
        context.previousOrdersData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast.error('Failed to update payment status', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 5000,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.stats() })
    }
  })
}

// Hook for bulk refetching (useful for manual refresh)
export function useRefreshOrders() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
    toast.success('Orders refreshed', {
      duration: 2000,
    })
  }
}

// Hook for fetching order details by orderId
export function useOrderDetailsByOrderId(orderId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: orderQueryKeys.detail(orderId),
    queryFn: async () => {
      const response = await ordersApi.getOrderDetailsByOrderId(orderId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch order details')
      }
      return response.data!
    },
    enabled: enabled && !!orderId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })
}

// Hook for managing filter state with URL synchronization
export function useOrderFilters(initialFilters: OrderFilters = {}) {
  const [filters, setFilters] = useState<OrderFilters>(initialFilters)

  // Update filters with validation
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page when other filters change
      ...(Object.keys(newFilters).some(key => key !== 'page') && { page: 1 })
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: filters.limit || 10 })
  }, [filters.limit])

  return {
    filters,
    updateFilters,
    clearFilters,
    setFilters
  }
}

// Additional helper hooks
export function useOrdersPagination(filters: OrderFilters, ordersData?: OrdersResponse) {
  const totalPages = ordersData?.pagination.totalPages || 0
  const currentPage = filters.page || 1

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      return { ...filters, page }
    }
    return filters
  }, [filters, totalPages])

  const goToNextPage = useCallback(() => {
    return goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const goToPreviousPage = useCallback(() => {
    return goToPage(currentPage - 1)
  }, [currentPage, goToPage])
  return {
    currentPage,
    totalPages,
    hasNextPage: ordersData?.pagination.hasNextPage || false,
    hasPreviousPage: ordersData?.pagination.hasPreviousPage || false,
    goToPage,
    goToNextPage,
    goToPreviousPage
  }
}
