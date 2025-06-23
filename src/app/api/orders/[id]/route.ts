import { NextRequest } from 'next/server'
import { z } from 'zod'
import db from '@/db'
import { orders, orderItems } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Validation schema for business order ID (flexible format)
const OrderParamsSchema = z.object({
  id: z.string()
    .min(1, "Order ID is required")
    .max(50, "Order ID must be at most 50 characters")
    .regex(/^[A-Z0-9-]+$/, "Order ID must contain only uppercase letters, numbers, and hyphens")
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Received order ID:', id, 'Type:', typeof id, 'Length:', id?.length)

    const validatedParams = OrderParamsSchema.parse({ id })
    console.log('Validated params:', validatedParams)
    // Get order details
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, validatedParams.id))

    if (!order) {
      return Response.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))

    return Response.json({
      success: true,
      data: {
        order,
        items
      }
    })
  } catch (error) {
    console.error('Order Details API Error:', error)
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors)
      return Response.json({
        success: false,
        error: 'Invalid order ID format',
        details: error.errors,
        received: error.errors[0]?.received
      }, { status: 400 })
    }

    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PATCH endpoint for updating order payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const validatedParams = OrderParamsSchema.parse({ id })
    const body = await request.json()

    // Validation schema for patch body
    const PatchOrderSchema = z.object({
      paid: z.boolean()
    })

    const validatedBody = PatchOrderSchema.parse(body)
    // Check if order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, validatedParams.id))

    if (!existingOrder) {
      return Response.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }
    // Update order payment status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        paid: validatedBody.paid,
        updatedAt: new Date()
      })
      .where(eq(orders.orderId, validatedParams.id))
      .returning()

    return Response.json({
      success: true,
      data: {
        order: updatedOrder,
        message: `Order marked as ${validatedBody.paid ? 'paid' : 'unpaid'}`
      }
    })
  } catch (error) {
    console.error('Order Update API Error:', error)

    return error instanceof z.ZodError
      ? Response.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
      : Response.json({
        success: false,
        error: 'Internal server error'
      }, { status: 500 })
  }
}
