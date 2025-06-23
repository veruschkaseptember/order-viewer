import { pgTable, serial, varchar, decimal, boolean, timestamp, integer, index, pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Define PostgreSQL enum for order status
export const orderStatusEnum = pgEnum('order_status', ['Pending', 'Processing', 'Shipped', 'Cancelled']);

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    orderId: varchar('order_id', { length: 50 }).notNull().unique(),
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    status: orderStatusEnum('status').notNull(), total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    paid: boolean('paid').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    // Indexes for filtering performance
    statusIdx: index('orders_status_idx').on(table.status),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
    totalIdx: index('orders_total_idx').on(table.total),
    paidIdx: index('orders_paid_idx').on(table.paid),
}));

export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productName: varchar('product_name', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
    // Index for joining with orders
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
}));

// Zod schemas for validation
export const orderStatusZodEnum = z.enum(['Pending', 'Processing', 'Shipped', 'Cancelled']);

export const insertOrderSchema = z.object({
    orderId: z.string().min(1).max(50),
    customerName: z.string().min(1).max(255),
    status: orderStatusZodEnum,
    total: z.string().regex(/^\d+\.\d{2}$/),
    paid: z.boolean().default(false),
});

export const selectOrderSchema = insertOrderSchema.extend({
    id: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const insertOrderItemSchema = z.object({
    orderId: z.number(),
    productName: z.string().min(1).max(255),
    quantity: z.number().min(1),
    price: z.string().regex(/^\d+\.\d{2}$/),
});

export const selectOrderItemSchema = insertOrderItemSchema.extend({
    id: z.number(),
});

// Type exports
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SelectOrder = z.infer<typeof selectOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type SelectOrderItem = z.infer<typeof selectOrderItemSchema>;
export type OrderStatus = z.infer<typeof orderStatusZodEnum>;