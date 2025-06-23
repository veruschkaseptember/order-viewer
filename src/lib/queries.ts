import type { ValidatedOrderFilters } from './api-client'

export const queryKeys = {
    orders: () => ['orders'] as const,
    stats: () => ['stats'] as const,
    ordersList: (filters?: ValidatedOrderFilters) =>
        filters ? ['orders', 'list', filters] as const : ['orders', 'list'] as const,
    orderDetails: (orderId: string) => ['orders', 'detail', orderId] as const,
    ordersStats: (filters?: ValidatedOrderFilters) =>
        filters ? ['stats', 'orders', filters] as const : ['stats', 'orders'] as const,
}

export const defaultQueryOptions = {
    queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    },
    mutations: {
        retry: 1,
    }
}

export const queryConfigs = {
    ordersList: (filters?: ValidatedOrderFilters) => ({
        queryKey: queryKeys.ordersList(filters),
        staleTime: 2 * 60 * 1000,
    }),
    orderDetails: (orderId: string) => ({
        queryKey: queryKeys.orderDetails(orderId),
        staleTime: 10 * 60 * 1000,
        enabled: !!orderId,
    }),
    ordersStats: (filters?: ValidatedOrderFilters) => ({
        queryKey: queryKeys.ordersStats(filters),
        staleTime: 1 * 60 * 1000,
    })
}
