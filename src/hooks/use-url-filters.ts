"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo, useTransition } from 'react'
import { useDebounce } from 'use-debounce'
import { OrderFilters } from '@/lib/api-client'

interface URLFilters {
    dateFrom?: string
    dateTo?: string
    status?: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled'
    paid?: boolean
    search?: string
    page?: number
    limit?: number
}

interface LocalFilters {
    minTotal?: number
    maxTotal?: number
    sortBy?: 'createdAt' | 'total' | 'customerName' | 'status'
    sortOrder?: 'asc' | 'desc'
}

export function useURLFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const urlFilters = useMemo<URLFilters>(() => {
        const filters: URLFilters = {}
        const dateFrom = searchParams.get('dateFrom')
        const dateTo = searchParams.get('dateTo')
        const status = searchParams.get('status')
        const paid = searchParams.get('paid')
        const search = searchParams.get('search')
        const page = searchParams.get('page')
        const limit = searchParams.get('limit')

        if (dateFrom) filters.dateFrom = dateFrom
        if (dateTo) filters.dateTo = dateTo
        if (status && ['Pending', 'Processing', 'Shipped', 'Cancelled'].includes(status)) {
            filters.status = status as 'Pending' | 'Processing' | 'Shipped' | 'Cancelled'
        }
        if (paid !== null && paid !== undefined) filters.paid = paid === 'true'
        if (search) filters.search = search
        if (page) filters.page = parseInt(page, 10) || 1
        if (limit) filters.limit = parseInt(limit, 10) || 50

        return filters
    }, [searchParams])

    const [debouncedURLFilters] = useDebounce(urlFilters, 300)

    const updateURLFilters = useCallback((newFilters: Partial<URLFilters>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key)
            } else {
                params.set(key, value.toString())
            }
        })

        if (Object.keys(newFilters).some(key => key !== 'page' && key !== 'limit')) {
            params.delete('page')
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }, [searchParams, pathname, router])

    const clearURLFilters = useCallback(() => {
        startTransition(() => {
            router.push(pathname)
        })
    }, [pathname, router])

    const toOrderFilters = useCallback((localFilters: LocalFilters = {}): OrderFilters => {
        return {
            ...urlFilters,
            ...localFilters,
            page: urlFilters.page || 1,
            limit: urlFilters.limit || 50,
            sortBy: localFilters.sortBy || 'createdAt',
            sortOrder: localFilters.sortOrder || 'desc'
        }
    }, [urlFilters])

    const toDebouncedOrderFilters = useCallback((localFilters: LocalFilters = {}): OrderFilters => {
        return {
            ...debouncedURLFilters,
            ...localFilters,
            // Ensure defaults
            page: debouncedURLFilters.page || 1,
            limit: debouncedURLFilters.limit || 50,
            sortBy: localFilters.sortBy || 'createdAt',
            sortOrder: localFilters.sortOrder || 'desc'
        }
    }, [debouncedURLFilters])

    return {
        // Current state
        urlFilters,
        debouncedURLFilters,
        isPending,        // Actions
        updateURLFilters,
        clearURLFilters, toOrderFilters, // Use for immediate UI updates
        toDebouncedOrderFilters,
        hasActiveFilters: Object.keys(urlFilters).length > 0
    }
}
