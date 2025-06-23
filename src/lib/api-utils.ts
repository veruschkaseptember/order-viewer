import { z } from 'zod'
import { NextRequest } from 'next/server'
import { orderStatusZodEnum } from '@/db/schema'

// Shared validation schemas
export const OrderFiltersSchema = z.object({
  status: orderStatusZodEnum.optional(),
  paid: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  dateTo: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  minTotal: z.string().regex(/^\d+(\.\d{2})?$/).optional().transform(val => val ? parseFloat(val) : undefined),
  maxTotal: z.string().regex(/^\d+(\.\d{2})?$/).optional().transform(val => val ? parseFloat(val) : undefined),
  page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().regex(/^\d+$/).optional().transform(val => val ? Math.min(parseInt(val), 100) : 10),
  sortBy: z.enum(['createdAt', 'total', 'customerName', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

export const OrderIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(val => parseInt(val))
})

export const PaymentUpdateSchema = z.object({
  paid: z.boolean()
})

// Types
export type OrderFilters = z.infer<typeof OrderFiltersSchema>
export type OrderId = z.infer<typeof OrderIdSchema>
export type PaymentUpdate = z.infer<typeof PaymentUpdateSchema>

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: unknown[]
}

// Utility functions
export const parseQueryParams = (request: NextRequest) =>
  Object.fromEntries(request.nextUrl.searchParams.entries())

export const createSuccessResponse = <T>(data: T): Response =>
  Response.json({ success: true, data })

export const createErrorResponse = (
  error: string,
  status = 500,
  details?: unknown[]
): Response =>
  Response.json({ success: false, error, details }, { status })

export const handleApiError = (error: unknown): Response => {
  console.error('API Error:', error)

  return error instanceof z.ZodError
    ? createErrorResponse('Invalid request parameters', 400, error.errors)
    : createErrorResponse('Internal server error')
}
