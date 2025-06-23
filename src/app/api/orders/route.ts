import { NextRequest } from 'next/server'
import { z } from 'zod'
import db from '@/db'
import { orders, orderStatusZodEnum } from '@/db/schema'
import { and, eq, gte, lte, ilike, desc, asc, count } from 'drizzle-orm'

// Validation schema for query parameters
const OrderQuerySchema = z.object({
  status: orderStatusZodEnum.optional(),
  paid: z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
  search: z.string().optional(), dateFrom: z.string().optional().transform(val => {
    if (!val) return undefined;

    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }), dateTo: z.string().optional().transform(val => {
    if (!val) return undefined;

    const date = new Date(val);
    if (isNaN(date.getTime())) return undefined;    // If it's a date-only string (no time part), set to end of day
    if (val.length === 10 && /^\d{4}-\d{2}-\d{2}$/.exec(val)) {
      date.setHours(23, 59, 59, 999);
    }
    return date;
  }),
  minTotal: z.string().regex(/^\d+(\.\d{2})?$/).optional().transform(val => val ? parseFloat(val) : undefined),
  maxTotal: z.string().regex(/^\d+(\.\d{2})?$/).optional().transform(val => val ? parseFloat(val) : undefined),
  page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().regex(/^\d+$/).optional().transform(val => val ? Math.min(parseInt(val), 100) : 10),
  sortBy: z.enum(['createdAt', 'total', 'customerName', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = OrderQuerySchema.parse(queryParams)

    const {
      status,
      paid,
      search,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      page,
      limit,
      sortBy,
      sortOrder
    } = validatedParams

    const whereConditions = [
      status ? eq(orders.status, status) : null,
      paid !== undefined ? eq(orders.paid, paid) : null,
      search ? ilike(orders.customerName, `%${search}%`) : null,
      dateFrom ? gte(orders.createdAt, dateFrom) : null,
      dateTo ? lte(orders.createdAt, dateTo) : null,
      minTotal !== undefined ? gte(orders.total, minTotal.toString()) : null,
      maxTotal !== undefined ? lte(orders.total, maxTotal.toString()) : null,
    ].filter((condition): condition is NonNullable<typeof condition> => condition !== null)

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(whereClause)

    const total = totalResult.count
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit

    // Get paginated orders
    const orderByColumn = orders[sortBy]
    const orderClause = sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn)

    const ordersResult = await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        customerName: orders.customerName,
        status: orders.status,
        total: orders.total,
        paid: orders.paid,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt
      })
      .from(orders).where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset)

    return Response.json({
      success: true,
      data: {
        orders: ordersResult,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }, filters: Object.fromEntries(
          Object.entries(validatedParams).filter(([, value]) => value !== undefined)
        )
      }
    })

  } catch (error) {
    console.error('Orders API Error:', error)

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
