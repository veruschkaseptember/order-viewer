import { NextRequest } from 'next/server'
import { z } from 'zod'
import db from '@/db'
import { orders, orderStatusZodEnum } from '@/db/schema'
import { and, eq, gte, lte, ilike, count, sum, avg, SQL } from 'drizzle-orm'

// Type for status breakdown result
type StatusBreakdownItem = {
  status: 'Pending' | 'Processing' | 'Shipped' | 'Cancelled'
  count: number
  revenue: string | null
}

// Reuse the same validation schema as the main orders route
const StatsQuerySchema = z.object({
  status: orderStatusZodEnum.optional(),
  paid: z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
  search: z.string().optional(),
  dateFrom: z.string().optional().transform(val => val ? new Date(val + 'T00:00:00Z') : undefined),
  dateTo: z.string().optional().transform(val => val ? new Date(val + 'T23:59:59Z') : undefined),
  minTotal: z.string().regex(/^\d+(\.\d{2})?$/).optional().transform(val => val ? parseFloat(val) : undefined),
  maxTotal: z.string().regex(/^\d+(\.\d{2})?$/).optional().transform(val => val ? parseFloat(val) : undefined)
})


function buildWhereConditions(params: z.infer<typeof StatsQuerySchema>, excludePaid = false) {
  const { status, paid, search, dateFrom, dateTo, minTotal, maxTotal } = params

  const conditions = [
    status ? eq(orders.status, status) : null,
    !excludePaid && paid !== undefined ? eq(orders.paid, paid) : null,
    search ? ilike(orders.customerName, `%${search}%`) : null,
    dateFrom ? gte(orders.createdAt, dateFrom) : null,
    dateTo ? lte(orders.createdAt, dateTo) : null,
    minTotal !== undefined ? gte(orders.total, minTotal.toString()) : null,
    maxTotal !== undefined ? lte(orders.total, maxTotal.toString()) : null,
  ].filter((condition): condition is NonNullable<typeof condition> => condition !== null)

  return conditions.length > 0 ? and(...conditions) : undefined
}


async function getOverviewStats(whereClause: ReturnType<typeof and> | undefined) {
  const [result] = await db
    .select({
      totalOrders: count(),
      totalRevenue: sum(orders.total),
      averageOrderValue: avg(orders.total)
    })
    .from(orders)
    .where(whereClause)

  return {
    totalOrders: result.totalOrders ?? 0,
    totalRevenue: parseFloat(result.totalRevenue ?? '0'),
    averageOrderValue: parseFloat(result.averageOrderValue ?? '0')
  }
}


async function getStatusBreakdown(whereClause: ReturnType<typeof and> | undefined) {
  const results = await db
    .select({
      status: orders.status,
      count: count(),
      revenue: sum(orders.total)
    })
    .from(orders)
    .where(whereClause)
    .groupBy(orders.status)

  return results.map((item: StatusBreakdownItem) => ({
    status: item.status,
    count: item.count,
    revenue: parseFloat(item.revenue ?? '0')
  }))
}


async function getPaymentStats(baseWhereClause: ReturnType<typeof and> | undefined) {
  const [paidStats] = await db
    .select({
      paidOrders: count(),
      paidRevenue: sum(orders.total)
    })
    .from(orders)
    .where(baseWhereClause ? and(baseWhereClause, eq(orders.paid, true)) : eq(orders.paid, true))

  const [unpaidStats] = await db
    .select({
      unpaidOrders: count(),
      unpaidRevenue: sum(orders.total)
    })
    .from(orders)
    .where(baseWhereClause ? and(baseWhereClause, eq(orders.paid, false)) : eq(orders.paid, false))

  return {
    paid: {
      count: paidStats.paidOrders ?? 0,
      revenue: parseFloat(paidStats.paidRevenue ?? '0')
    },
    unpaid: {
      count: unpaidStats.unpaidOrders ?? 0,
      revenue: parseFloat(unpaidStats.unpaidRevenue ?? '0')
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    console.log('Stats API - Raw search params:', Object.fromEntries(searchParams.entries()))

    // Parse and validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = StatsQuerySchema.parse(queryParams)
    console.log('Stats API - Validated params:', validatedParams)

    // Build WHERE conditions for all queries and payment-specific queries
    const whereClause = buildWhereConditions(validatedParams)
    const baseWhereClause = buildWhereConditions(validatedParams, true) // Exclude paid filter

    console.log('Stats API - WHERE conditions applied')

    // Get all statistics in parallel for better performance
    const [overview, statusBreakdown, paymentStatus] = await Promise.all([
      getOverviewStats(whereClause),
      getStatusBreakdown(whereClause),
      getPaymentStats(baseWhereClause)
    ])

    return Response.json({
      success: true,
      data: {
        overview,
        statusBreakdown,
        paymentStatus,
        filters: validatedParams // Echo back applied filters
      }
    })
  } catch (error) {
    console.error('Stats API Error:', error)

    return error instanceof z.ZodError
      ? Response.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 })
      : Response.json({
        success: false,
        error: 'Internal server error'
      }, { status: 500 })
  }
}
