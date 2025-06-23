# Order Viewer Dashboard

A professional, modern order management dashboard built with Next.js 15, featuring real-time data updates, advanced filtering, and a responsive UI.

![Order Viewer Dashboard](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-2.50-3ecf8e)

## ✨ Features

### 📊 Order Management

- **Real-time Order Table**: View all orders with Order ID, Customer, Status, Total (ZAR), and Creation Date
- **Mark as Paid**: Instant optimistic updates for payment status with toggle functionality
- **Order Details**: Click any row to view detailed line items, quantities, and prices
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🔍 Advanced Filtering

- **Search**: Find orders by customer name or order ID
- **Date Range**: Filter orders by creation date with calendar picker
- **Status Filter**: Filter by order status (Pending, Processing, Shipped, Cancelled)
- **Payment Status**: Filter by paid/unpaid status
- **Total Range**: Set minimum and maximum order value filters
- **URL-based State**: Filters persist in URL for sharing and bookmarking
- **Debounced Updates**: Smooth, performant filtering with 300ms debounce

### 📈 Live Statistics

- **Total Orders**: Real-time count of filtered orders
- **Total Revenue**: Sum of all filtered order totals in ZAR
- **Paid Orders**: Count and percentage of paid orders
- **Pending Orders**: Count of orders awaiting processing

### 🎨 User Experience

- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Modern UI**: Built with ShadCN/UI components and Tailwind CSS
- **Loading States**: Skeleton loaders during data fetching
- **Error Handling**: Graceful error states with retry mechanisms
- **Optimistic Updates**: Instant UI feedback for user actions

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **ShadCN/UI** - Modern, accessible component library
- **Lucide React** - Beautiful, customizable icons
- **next-themes** - Dark/light theme support

### Backend & Database

- **Supabase** - PostgreSQL database with real-time capabilities
- **Drizzle ORM** - Type-safe database operations
- **Zod** - Runtime type validation and schemas

### State Management & Data Fetching

- **TanStack Query** - Powerful data synchronization
- **use-debounce** - Debounced state updates
- **URL State Management** - Filter state persisted in URL

### Development Tools

- **ESLint** - Code linting and formatting
- **Drizzle Kit** - Database schema management
- **TSX** - TypeScript execution for scripts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd order-viewer
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_postgresql_connection_string
```

### 3. Database Setup

```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (50 orders)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the order dashboard.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/orders/              # REST API endpoints
│   │   ├── route.ts            # GET /api/orders (with filtering)
│   │   ├── stats/route.ts      # GET /api/orders/stats
│   │   └── [id]/
│   │       ├── route.ts        # GET /api/orders/[id]
│   │       └── payment/route.ts # PATCH /api/orders/[id]/payment
│   ├── dashboard/page.tsx       # Main dashboard page
│   └── layout.tsx              # Root layout with providers
├── components/
│   ├── data-table.tsx          # Main orders table component
│   ├── order-stats-cards.tsx   # Live statistics cards
│   ├── OrderDetailsDrawer.tsx  # Order details side panel
│   ├── filters/                # Filter components
│   │   ├── FilterPanel.tsx     # Main filter container
│   │   ├── SearchFilter.tsx    # Search by customer/ID
│   │   ├── DateRangeFilter.tsx # Date range picker
│   │   ├── StatusFilter.tsx    # Order status filter
│   │   ├── PaidStatusFilter.tsx # Payment status filter
│   │   ├── TotalRangeFilter.tsx # Min/max total filter
│   │   └── ActiveFiltersChips.tsx # Active filter chips
│   └── ui/                     # ShadCN UI components
├── db/
│   ├── schema.ts               # Database schema & Zod validation
│   ├── seed.ts                 # Database seeding script
│   └── index.ts                # Database connection
├── hooks/
│   ├── use-orders.ts           # TanStack Query hooks
│   └── use-url-filters.ts      # URL-based filter state
└── lib/
    ├── api-client.ts           # API client functions
    ├── queries.ts              # Database queries
    └── utils.ts                # Utility functions
```

## 🗄️ Database Schema

### Orders Table

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  status order_status NOT NULL, -- enum: Pending, Processing, Shipped, Cancelled
  total DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## 🔌 API Endpoints

### GET /api/orders

Fetch orders with optional filtering

```typescript
// Query parameters
{
  page?: number;          // Page number (default: 1)
  limit?: number;         // Items per page (default: 50)
  search?: string;        // Search customer name or order ID
  status?: OrderStatus;   // Filter by order status
  paid?: boolean;         // Filter by payment status
  dateFrom?: string;      // Filter from date (YYYY-MM-DD)
  dateTo?: string;        // Filter to date (YYYY-MM-DD)
  minTotal?: number;      // Minimum order total
  maxTotal?: number;      // Maximum order total
}
```

### GET /api/orders/stats

Get aggregated statistics with same filters as orders endpoint

### GET /api/orders/[id]

Fetch order details including line items

### PATCH /api/orders/[id]/payment

Toggle payment status of an order

## 🎯 Development Guidelines

### Code Architecture

- **SOLID Principles**: Single responsibility, dependency injection
- **Component Composition**: Reusable, composable UI components
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Error Boundaries**: Graceful error handling throughout the app
- **Performance**: Optimized with React Query caching and debouncing

### State Management

- **Server State**: TanStack Query for API data
- **URL State**: Filter parameters in URL for shareability
- **Local State**: React hooks for component-specific state
- **Theme State**: next-themes for dark/light mode

### Best Practices

- **API-First**: All data comes from backend, no mock data
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation
- **Loading States**: Skeleton loaders and loading indicators
- **Optimistic Updates**: Instant UI feedback

## 📝 Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:seed      # Seed database with sample data
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - The open source Firebase alternative
- [ShadCN/UI](https://ui.shadcn.com/) - Re-usable components built with Radix UI
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization for TypeScript
# ov
