
// Type definitions for validation
interface OrderInput {
    orderId?: unknown;
    customerName?: unknown;
    status?: unknown;
    total?: unknown;
    paid?: unknown;
    [key: string]: unknown;
}

interface OrderStatsInput {
    overview?: {
        totalOrders?: unknown;
        totalRevenue?: unknown;
        averageOrderValue?: unknown;
    };
    paymentStatus?: {
        paid?: unknown;
        unpaid?: unknown;
    };
    statusBreakdown?: unknown;
    [key: string]: unknown;
}

interface ValidOrder {
    orderId: string;
    customerName: string;
    status: string;
    total: string;
    paid: boolean;
}

interface ValidOrderStats {
    overview: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    };
    paymentStatus: {
        paid: { count: number; revenue: number };
        unpaid: { count: number; revenue: number };
    };
    statusBreakdown: Array<{
        status: string;
        count: number;
        revenue: number;
    }>;
}

export function isValidOrder(order: unknown): order is ValidOrder {
    return (
        order !== null &&
        order !== undefined &&
        typeof order === 'object' &&
        typeof (order as OrderInput).orderId === 'string' &&
        typeof (order as OrderInput).customerName === 'string' &&
        typeof (order as OrderInput).status === 'string' &&
        typeof (order as OrderInput).total === 'string' &&
        typeof (order as OrderInput).paid === 'boolean'
    );
}

export function isValidOrderStats(stats: unknown): stats is ValidOrderStats {
    if (!stats || typeof stats !== 'object') return false;

    const s = stats as OrderStatsInput;
    return (
        s.overview !== null &&
        s.overview !== undefined &&
        typeof s.overview === 'object' &&
        typeof s.overview.totalOrders === 'number' &&
        typeof s.overview.totalRevenue === 'number' &&
        s.paymentStatus !== null &&
        s.paymentStatus !== undefined &&
        typeof s.paymentStatus === 'object' &&
        s.paymentStatus.paid !== null &&
        s.paymentStatus.paid !== undefined &&
        s.paymentStatus.unpaid !== null &&
        s.paymentStatus.unpaid !== undefined
    );
}

export function validateAndSanitizeOrders(orders: unknown): ValidOrder[] {
    if (!Array.isArray(orders)) {
        return [];
    }

    return orders.filter(isValidOrder);
}

export function sanitizeOrderStats(stats: unknown): ValidOrderStats {
    if (!isValidOrderStats(stats)) {
        return {
            overview: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
            paymentStatus: {
                paid: { count: 0, revenue: 0 },
                unpaid: { count: 0, revenue: 0 }
            },
            statusBreakdown: []
        };
    }

    return stats;
}
