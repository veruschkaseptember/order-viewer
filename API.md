# API Documentation

The Order Viewer Dashboard provides a RESTful API for managing orders and retrieving statistics. All endpoints return JSON responses and support filtering, pagination, and error handling.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Orders](#orders)
  - [Order Details](#order-details)
  - [Order Payment](#order-payment)
  - [Order Statistics](#order-statistics)
- [Data Models](#data-models)
- [Examples](#examples)

## 🌐 Base URL

```
http://localhost:3000/api
```

For production, replace with your deployed domain.

## 🔐 Authentication

Currently, the API doesn't require authentication for demo purposes. In production, you would typically add:

```http
Authorization: Bearer <your-jwt-token>
```

## 📄 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": { ... },
  "pagination": { // Only for paginated endpoints
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Error Response

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    // Optional additional details
    "field": "validation error message"
  }
}
```

## ❌ Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `ORDER_NOT_FOUND` - Order with specified ID not found
- `DATABASE_ERROR` - Database operation failed

## 🔌 Endpoints

### Orders

#### GET /api/orders

Retrieve a paginated list of orders with optional filtering.

**Query Parameters:**

| Parameter  | Type    | Default | Description                         |
| ---------- | ------- | ------- | ----------------------------------- |
| `page`     | number  | 1       | Page number for pagination          |
| `limit`    | number  | 50      | Number of items per page (max: 100) |
| `search`   | string  | -       | Search by customer name or order ID |
| `status`   | string  | -       | Filter by order status              |
| `paid`     | boolean | -       | Filter by payment status            |
| `dateFrom` | string  | -       | Filter from date (YYYY-MM-DD)       |
| `dateTo`   | string  | -       | Filter to date (YYYY-MM-DD)         |
| `minTotal` | number  | -       | Minimum order total                 |
| `maxTotal` | number  | -       | Maximum order total                 |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "orderId": "ORD-2024-001",
      "customerName": "John Doe",
      "status": "Processing",
      "total": "299.99",
      "paid": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

**Example Requests:**

```bash
# Get all orders
GET /api/orders

# Get orders with search
GET /api/orders?search=john

# Get paid orders only
GET /api/orders?paid=true

# Get orders with date range
GET /api/orders?dateFrom=2024-01-01&dateTo=2024-01-31

# Get orders with multiple filters
GET /api/orders?status=Processing&paid=false&minTotal=100
```

### Order Details

#### GET /api/orders/[id]

Retrieve detailed information about a specific order, including line items.

**Path Parameters:**

| Parameter | Type   | Description                                     |
| --------- | ------ | ----------------------------------------------- |
| `id`      | string | Order ID (business identifier, not database ID) |

**Response:**

```json
{
  "data": {
    "id": 1,
    "orderId": "ORD-2024-001",
    "customerName": "John Doe",
    "status": "Processing",
    "total": "299.99",
    "paid": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "id": 1,
        "productName": "Wireless Headphones",
        "quantity": 2,
        "price": "149.99"
      },
      {
        "id": 2,
        "productName": "Phone Case",
        "quantity": 1,
        "price": "29.99"
      }
    ]
  }
}
```

**Example Requests:**

```bash
# Get order details
GET /api/orders/ORD-2024-001
```

**Error Responses:**

```json
// Order not found
{
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND"
}
```

### Order Payment

#### PATCH /api/orders/[id]/payment

Update the payment status of an order (toggle paid/unpaid).

**Path Parameters:**

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| `id`      | string | Order ID (business identifier) |

**Request Body:**

```json
{
  "paid": true
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "orderId": "ORD-2024-001",
    "customerName": "John Doe",
    "status": "Processing",
    "total": "299.99",
    "paid": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T14:22:00Z"
  }
}
```

**Example Requests:**

```bash
# Mark order as paid
PATCH /api/orders/ORD-2024-001/payment
Content-Type: application/json

{
  "paid": true
}

# Mark order as unpaid
PATCH /api/orders/ORD-2024-001/payment
Content-Type: application/json

{
  "paid": false
}
```

**Error Responses:**

```json
// Invalid request body
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "paid": "Expected boolean"
  }
}

// Order not found
{
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND"
}
```

### Order Statistics

#### GET /api/orders/stats

Retrieve aggregated statistics for orders. Supports the same filtering parameters as the orders endpoint.

**Query Parameters:**

Same filtering parameters as `/api/orders` endpoint.

**Response:**

```json
{
  "data": {
    "totalOrders": 150,
    "totalRevenue": "45299.50",
    "paidOrders": 120,
    "pendingOrders": 25
  }
}
```

**Example Requests:**

```bash
# Get all stats
GET /api/orders/stats

# Get stats for paid orders only
GET /api/orders/stats?paid=true

# Get stats for date range
GET /api/orders/stats?dateFrom=2024-01-01&dateTo=2024-01-31

# Get stats with multiple filters
GET /api/orders/stats?status=Processing&minTotal=100
```

## 📊 Data Models

### Order

```typescript
interface Order {
  id: number; // Database primary key
  orderId: string; // Business identifier (unique)
  customerName: string; // Customer's full name
  status: OrderStatus; // Order status enum
  total: string; // Order total as decimal string
  paid: boolean; // Payment status
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

### Order Item

```typescript
interface OrderItem {
  id: number; // Database primary key
  orderId: number; // Foreign key to orders.id
  productName: string; // Product name
  quantity: number; // Item quantity
  price: string; // Item price as decimal string
}
```

### Order Status

```typescript
type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';
```

### Order Statistics

```typescript
interface OrderStats {
  totalOrders: number; // Total count of orders
  totalRevenue: string; // Sum of all order totals
  paidOrders: number; // Count of paid orders
  pendingOrders: number; // Count of pending orders
}
```

### Pagination

```typescript
interface Pagination {
  page: number; // Current page number
  limit: number; // Items per page
  total: number; // Total items count
  pages: number; // Total pages count
}
```

## 💡 Examples

### JavaScript/TypeScript Client

```typescript
class OrderAPIClient {
  private baseURL = '/api';

  async getOrders(filters: OrderFilters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseURL}/orders?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getOrderDetails(orderId: string) {
    const response = await fetch(`${this.baseURL}/orders/${orderId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updatePaymentStatus(orderId: string, paid: boolean) {
    const response = await fetch(`${this.baseURL}/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paid }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getStats(filters: OrderFilters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseURL}/orders/stats?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Usage
const client = new OrderAPIClient();

// Get all orders
const orders = await client.getOrders();

// Get filtered orders
const filteredOrders = await client.getOrders({
  status: 'Processing',
  paid: false,
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
});

// Get order details
const orderDetails = await client.getOrderDetails('ORD-2024-001');

// Update payment status
await client.updatePaymentStatus('ORD-2024-001', true);

// Get statistics
const stats = await client.getStats({ paid: true });
```

### cURL Examples

```bash
# Get all orders
curl -X GET "http://localhost:3000/api/orders"

# Get filtered orders
curl -X GET "http://localhost:3000/api/orders?status=Processing&paid=false"

# Get order details
curl -X GET "http://localhost:3000/api/orders/ORD-2024-001"

# Update payment status
curl -X PATCH "http://localhost:3000/api/orders/ORD-2024-001/payment" \
  -H "Content-Type: application/json" \
  -d '{"paid": true}'

# Get statistics
curl -X GET "http://localhost:3000/api/orders/stats?dateFrom=2024-01-01"
```

### Python Client

```python
import requests
from typing import Optional, Dict, Any

class OrderAPIClient:
    def __init__(self, base_url: str = "http://localhost:3000/api"):
        self.base_url = base_url

    def get_orders(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get orders with optional filtering."""
        params = {}
        if filters:
            params = {k: v for k, v in filters.items() if v is not None}

        response = requests.get(f"{self.base_url}/orders", params=params)
        response.raise_for_status()
        return response.json()

    def get_order_details(self, order_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific order."""
        response = requests.get(f"{self.base_url}/orders/{order_id}")
        response.raise_for_status()
        return response.json()

    def update_payment_status(self, order_id: str, paid: bool) -> Dict[str, Any]:
        """Update the payment status of an order."""
        response = requests.patch(
            f"{self.base_url}/orders/{order_id}/payment",
            json={"paid": paid}
        )
        response.raise_for_status()
        return response.json()

    def get_stats(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get order statistics with optional filtering."""
        params = {}
        if filters:
            params = {k: v for k, v in filters.items() if v is not None}

        response = requests.get(f"{self.base_url}/orders/stats", params=params)
        response.raise_for_status()
        return response.json()

# Usage
client = OrderAPIClient()

# Get all orders
orders = client.get_orders()

# Get filtered orders
filtered_orders = client.get_orders({
    "status": "Processing",
    "paid": False,
    "date_from": "2024-01-01"
})

# Get order details
order_details = client.get_order_details("ORD-2024-001")

# Update payment status
client.update_payment_status("ORD-2024-001", True)

# Get statistics
stats = client.get_stats({"paid": True})
```

## 🔄 Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing:

- Rate limiting per IP address
- Authentication-based rate limiting
- Caching for frequently accessed data

## 📈 Performance Considerations

- Use pagination for large datasets
- Implement proper database indexes
- Cache frequently accessed statistics
- Use debouncing for search queries
- Consider implementing GraphQL for complex queries

## 🔮 Future Enhancements

- Authentication and authorization
- Webhooks for order status changes
- Real-time updates via WebSocket
- Bulk operations API
- Export functionality (CSV, PDF)
- Advanced analytics endpoints
