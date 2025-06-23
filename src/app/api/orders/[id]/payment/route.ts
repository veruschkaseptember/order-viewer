import { NextRequest } from 'next/server'
import { z } from 'zod'
import db from '@/db'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Validation schema for business order ID (flexible format)
const OrderParamsSchema = z.object({
  id: z.string()
    .min(1, "Order ID is required")
    .max(50, "Order ID must be at most 50 characters")
    .regex(/^[A-Z0-9-]+$/, "Order ID must contain only uppercase letters, numbers, and hyphens")
})

// Validation schema for payment update
const PaymentUpdateSchema = z.object({
  paid: z.boolean()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const validatedParams = OrderParamsSchema.parse({ id })
    const body = await request.json()
    const validatedBody = PaymentUpdateSchema.parse(body)
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

    // Prevent unnecessary updates
    if (existingOrder.paid === validatedBody.paid) {
      return Response.json({
        success: true,
        data: {
          order: existingOrder,
          message: `Order is already marked as ${validatedBody.paid ? 'paid' : 'unpaid'}`
        }
      })
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
        message: `Order successfully marked as ${validatedBody.paid ? 'paid' : 'unpaid'}`,
        previousStatus: existingOrder.paid,
        newStatus: validatedBody.paid
      }
    })

  } catch (error) {
    console.error('Payment Update API Error:', error)

    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }

    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
