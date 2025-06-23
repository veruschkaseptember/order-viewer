import { z } from 'zod'
import { orderStatusZodEnum } from '@/db/schema'

// Custom Error Classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Safe fetch wrapper with error handling
async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      error
    );
  }
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown[]
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface OrdersResponse {
  orders: Order[]
  pagination: PaginationInfo
}

export interface Order {
  id: number
  orderId: string
  customerName: string
  status: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled'
  total: string
  paid: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  productName: string
  quantity: number
  price: string
}

export interface OrderDetailsResponse {
  order: Order
  items: OrderItem[]
}

export interface OrderStats {
  overview: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
  }
  statusBreakdown: Array<{
    status: string
    count: number
    revenue: number
  }>
  paymentStatus: {
    paid: { count: number; revenue: number }
    unpaid: { count: number; revenue: number }
  }
  filters: OrderFilters
}

// Filter Types
export interface OrderFilters {
  status?: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled'
  paid?: boolean
  search?: string
  dateFrom?: string
  dateTo?: string
  minTotal?: number
  maxTotal?: number
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'total' | 'customerName' | 'status'
  sortOrder?: 'asc' | 'desc'
}

// API Client Class
export class OrdersApi {
  private baseUrl = '/api/orders'

  // Build query string from filters
  private buildQueryString(filters: OrderFilters): string {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return params.toString()
  }

  // Fetch orders with filtering and pagination
  async getOrders(filters: OrderFilters = {}): Promise<ApiResponse<OrdersResponse>> {
    try {
      const queryString = this.buildQueryString(filters)
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

      const response = await safeFetch(url, {
        method: 'GET',
        cache: 'no-store' // Ensure fresh data for live updates
      })

      return await response.json()
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  // Fetch order statistics
  async getOrderStats(filters: Omit<OrderFilters, 'page' | 'limit' | 'sortBy' | 'sortOrder'> = {}): Promise<ApiResponse<OrderStats>> {
    try {
      const queryString = this.buildQueryString(filters)
      const url = queryString ? `${this.baseUrl}/stats?${queryString}` : `${this.baseUrl}/stats`

      const response = await safeFetch(url, {
        method: 'GET',
        cache: 'no-store'
      })

      return await response.json()
    } catch (error) {
      console.error('Error fetching order stats:', error)
      throw error
    }
  }

  // Fetch individual order details
  async getOrderDetails(id: number): Promise<ApiResponse<OrderDetailsResponse>> {
    try {
      const response = await safeFetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        cache: 'no-store'
      })

      return await response.json()
    } catch (error) {
      console.error('Error fetching order details:', error)
      throw error
    }
  }

  // Fetch individual order details by orderId (string)
  async getOrderDetailsByOrderId(orderId: string): Promise<ApiResponse<OrderDetailsResponse>> {
    try {
      const response = await safeFetch(`${this.baseUrl}/${orderId}`, {
        method: 'GET',
        cache: 'no-store'
      })

      return await response.json()
    } catch (error) {
      console.error('Error fetching order details by orderId:', error)
      throw error
    }
  }

  // Update order payment status
  async updatePaymentStatus(orderId: string, paid: boolean): Promise<ApiResponse<{ order: Order; message: string }>> {
    try {
      const response = await safeFetch(`${this.baseUrl}/${orderId}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ paid })
      })

      return await response.json()
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }
}

// Export singleton instance
export const ordersApi = new OrdersApi()

// Validation schemas for frontend use
export const OrderFilterSchema = z.object({
  status: orderStatusZodEnum.optional(),
  paid: z.boolean().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minTotal: z.number().min(0).optional(),
  maxTotal: z.number().min(0).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'total', 'customerName', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export type ValidatedOrderFilters = z.infer<typeof OrderFilterSchema>
