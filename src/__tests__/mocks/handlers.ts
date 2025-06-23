import { http, HttpResponse } from 'msw';

export const handlers = [
    // Mock orders API
    http.get('/api/orders', () => {
        return HttpResponse.json({
            data: [
                {
                    id: '1',
                    orderId: 'ORD-001',
                    customerName: 'John Doe',
                    total: '150.00',
                    status: 'Shipped',
                    paid: true,
                    createdAt: '2024-01-01T00:00:00Z',
                },
                {
                    id: '2',
                    orderId: 'ORD-002',
                    customerName: 'Jane Smith',
                    total: '250.00',
                    status: 'Processing',
                    paid: false,
                    createdAt: '2024-01-02T00:00:00Z',
                },
            ],
            pagination: {
                total: 2,
                page: 1,
                pageSize: 10,
                totalPages: 1,
            },
        });
    }),

    // Mock order stats API
    http.get('/api/orders/stats', () => {
        return HttpResponse.json({
            overview: {
                totalOrders: 150,
                totalRevenue: 25000,
                averageOrderValue: 166.67,
            },
            statusBreakdown: [
                { status: 'Pending', count: 10, revenue: 1500 },
                { status: 'Processing', count: 20, revenue: 3000 },
                { status: 'Shipped', count: 100, revenue: 18000 },
                { status: 'Cancelled', count: 20, revenue: 2500 },
            ],
            paymentStatus: {
                paid: { count: 120, revenue: 22000 },
                unpaid: { count: 30, revenue: 3000 },
            },
        });
    }),

    // Mock payment status update
    http.patch('/api/orders/:orderId/payment', () => {
        return HttpResponse.json({ success: true });
    }),
];
