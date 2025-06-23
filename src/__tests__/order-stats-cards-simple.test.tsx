/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { OrderStatsCards } from '@/components/order-stats-cards';

// Mock the formatCurrency utility
jest.mock('@/lib/utils', () => ({
  formatCurrency: jest.fn((amount) => `$${amount.toFixed(2)}`),
}));

describe('OrderStatsCards', () => {
  const mockData = {
    overview: {
      totalOrders: 150,
      totalRevenue: 25000,
      averageOrderValue: 166.67,
    },
    statusBreakdown: [
      { status: 'Pending' as const, count: 10, revenue: 1500 },
      { status: 'Processing' as const, count: 20, revenue: 3000 },
      { status: 'Shipped' as const, count: 100, revenue: 18000 },
      { status: 'Cancelled' as const, count: 20, revenue: 2500 },
    ],
    paymentStatus: {
      paid: { count: 120, revenue: 22000 },
      unpaid: { count: 30, revenue: 3000 },
    },
  };

  describe('Loading State', () => {
    it('should render loading skeletons when isLoading is true', () => {
      render(<OrderStatsCards isLoading={true} />);

      expect(
        screen.getByRole('region', { name: /loading order statistics/i })
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('status', { name: /loading statistics card/i })
      ).toHaveLength(4);
    });
  });

  describe('No Data State', () => {
    it('should render "No statistics available" when data is null', () => {
      render(<OrderStatsCards data={undefined} />);

      expect(
        screen.getByRole('status', { name: /no statistics available/i })
      ).toBeInTheDocument();
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should render all statistics correctly with valid data', () => {
      render(<OrderStatsCards data={mockData} />);

      // Check total orders
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();

      // Check total revenue
      expect(screen.getByText('$25000.00')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();

      // Check paid percentage (120/150 = 80%)
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('Paid Orders')).toBeInTheDocument();

      // Check unpaid count
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Unpaid Orders')).toBeInTheDocument();
    });

    it('should handle null/undefined nested properties gracefully', () => {
      const incompleteData = {
        overview: undefined,
        paymentStatus: undefined,
      };

      // Should render without crashing
      expect(() => {
        render(<OrderStatsCards data={incompleteData as any} />);
      }).not.toThrow();

      // Should show fallback values
      expect(screen.getByText('0')).toBeInTheDocument(); // Default totalOrders
      expect(screen.getByText('$0.00')).toBeInTheDocument(); // Default totalRevenue
    });

    it('should calculate paid percentage correctly for edge cases', () => {
      const edgeCaseData = {
        overview: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
        statusBreakdown: [],
        paymentStatus: {
          paid: { count: 0, revenue: 0 },
          unpaid: { count: 0, revenue: 0 },
        },
      };

      render(<OrderStatsCards data={edgeCaseData} />);

      // When totalOrders is 0, paid percentage should be 0%
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
