// Load environment variables FIRST
import { config } from 'dotenv'

// Load only .env.local to avoid conflicts
console.log('Loading environment variables from .env.local...')
config({ path: '.env.local' })

console.log('After loading .env.local:')
console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)

import { faker } from '@faker-js/faker'
import db from './index'
import { orders, orderItems, type InsertOrder, type InsertOrderItem } from './schema'

async function seed() {
  console.log('Starting database seeding...')

  try {
    // Clear existing data
    console.log('Clearing existing data...')
    await db.delete(orderItems)
    await db.delete(orders)

    const ordersToCreate: InsertOrder[] = []
    const orderItemsToCreate: InsertOrderItem[] = []

    // Generate 50 demo orders
    console.log('Generating 50 demo orders...')

    for (let i = 0; i < 50; i++) {
      // Generate order data
      const orderId = faker.string.alphanumeric(8).toUpperCase()
      const customerName = faker.person.fullName()
      const status = faker.helpers.arrayElement(['Pending', 'Processing', 'Shipped', 'Cancelled'] as const)
      const paid = faker.datatype.boolean(0.7) // 70% chance of being paid
      // Generate order date within last 60 days (will be set by database default for now)
      // const createdAt = faker.date.recent({ days: 60 })

      // Generate 1-4 order items per order
      const itemCount = faker.number.int({ min: 1, max: 4 })
      let orderTotal = 0

      const tempOrderItems: Omit<InsertOrderItem, 'orderId'>[] = []

      for (let j = 0; j < itemCount; j++) {
        const productName = faker.commerce.productName()
        const quantity = faker.number.int({ min: 1, max: 3 })
        const price = faker.number.float({ min: 29.99, max: 899.99, fractionDigits: 2 })
        const itemTotal = quantity * price

        orderTotal += itemTotal

        tempOrderItems.push({
          productName,
          quantity,
          price: price.toFixed(2)
        })
      }
      // Create order record
      const orderData: InsertOrder = {
        orderId,
        customerName,
        status,
        total: orderTotal.toFixed(2),
        paid,
      }

      ordersToCreate.push(orderData)

      tempOrderItems.forEach(item => {
        orderItemsToCreate.push({
          ...item,
          orderId: i // Temporary index, will be replaced with actual ID
        })
      })
    }
    // Insert orders first
    console.log('Inserting orders into database...')
    const insertedOrders = await db.insert(orders).values(ordersToCreate).returning()

    // Update order items with correct order IDs
    console.log('Inserting order items into database...')
    const finalOrderItems: InsertOrderItem[] = []

    insertedOrders.forEach((order, orderIndex) => {
      // Find all items for this order (by temporary index)
      const itemsForThisOrder = orderItemsToCreate.filter(item => item.orderId === orderIndex)

      itemsForThisOrder.forEach(item => {
        finalOrderItems.push({
          ...item,
          orderId: order.id // Use actual order ID from database
        })
      })
    })

    await db.insert(orderItems).values(finalOrderItems)

    // Generate summary statistics
    const totalOrders = insertedOrders.length
    const totalItems = finalOrderItems.length
    const totalRevenue = insertedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0)
    const paidOrders = insertedOrders.filter(order => order.paid).length
    const statusBreakdown = insertedOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('\nDatabase seeding completed successfully!')
    console.log('\nSeeding Summary:')
    console.log(`   Orders created: ${totalOrders}`)
    console.log(`   Order items created: ${totalItems}`)
    console.log(`   Total revenue: R${totalRevenue.toFixed(2)}`)
    console.log(`   Paid orders: ${paidOrders}/${totalOrders} (${Math.round(paidOrders / totalOrders * 100)}%)`)
    console.log(`   Status breakdown:`)
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`)
    })

    console.log('\nReady to test your Order Viewer application!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

export default seed
