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
      { status: 'Pending', count: 10, revenue: 1500 },
      { status: 'Processing', count: 20, revenue: 3000 },
      { status: 'Shipped', count: 100, revenue: 18000 },
      { status: 'Cancelled', count: 20, revenue: 2500 },
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
      render(<OrderStatsCards data={null} />);

      expect(
        screen.getByRole('status', { name: /no statistics available/i })
      ).toBeInTheDocument();
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
    });

    it('should render "No statistics available" when data is undefined', () => {
      render(<OrderStatsCards />);

      expect(
        screen.getByRole('status', { name: /no statistics available/i })
      ).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should render all statistics cards with correct data', () => {
      render(<OrderStatsCards data={mockData} />);

      // Total Orders
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();

      // Total Revenue
      expect(screen.getByText('$25000.00')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();

      // Paid Orders (80% = 120/150)
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('Paid Orders')).toBeInTheDocument();

      // Unpaid Orders
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Unpaid Orders')).toBeInTheDocument();
    });

    it('should calculate paid percentage correctly', () => {
      render(<OrderStatsCards data={mockData} />);

      // 120 paid out of 150 total = 80%
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('should show excellent badge when paid percentage is >= 80%', () => {
      render(<OrderStatsCards data={mockData} />);

      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should show "needs attention" when paid percentage is < 80%', () => {
      const lowPaidData = {
        ...mockData,
        paymentStatus: {
          paid: { count: 50, revenue: 10000 },
          unpaid: { count: 100, revenue: 15000 },
        },
      };

      render(<OrderStatsCards data={lowPaidData} />);

      // 50 paid out of 150 total = 33%
      expect(screen.getByText('33%')).toBeInTheDocument();
      expect(screen.getByText('Needs attention')).toBeInTheDocument();
    });
  });

  describe('Edge Cases & Defensive Programming', () => {
    it('should handle missing overview data gracefully', () => {
      const incompleteData = {
        statusBreakdown: [],
        paymentStatus: {
          paid: { count: 0, revenue: 0 },
          unpaid: { count: 0, revenue: 0 },
        },
      };

      render(<OrderStatsCards data={incompleteData} />);

      // Should show 0 for missing overview data
      expect(screen.getByText('0')).toBeInTheDocument(); // Total orders
      expect(screen.getByText('$0.00')).toBeInTheDocument(); // Total revenue
    });

    it('should handle missing paymentStatus data gracefully', () => {
      const incompleteData = {
        overview: {
          totalOrders: 100,
          totalRevenue: 15000,
          averageOrderValue: 150,
        },
        statusBreakdown: [],
      };

      render(<OrderStatsCards data={incompleteData} />);

      // Should not crash and show 0% for paid percentage
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Unpaid count
    });

    it('should handle zero total orders without division by zero', () => {
      const zeroOrdersData = {
        overview: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
        },
        statusBreakdown: [],
        paymentStatus: {
          paid: { count: 0, revenue: 0 },
          unpaid: { count: 0, revenue: 0 },
        },
      };

      render(<OrderStatsCards data={zeroOrdersData} />);

      expect(screen.getByText('0%')).toBeInTheDocument(); // Should be 0%, not NaN%
    });

    it('should handle partial nested data', () => {
      const partialData = {
        overview: {
          totalOrders: 50,
          // missing totalRevenue and averageOrderValue
        },
        paymentStatus: {
          paid: { count: 30 },
          // missing unpaid data
        },
      };

      render(<OrderStatsCards data={partialData} />);

      // Should not crash and provide reasonable fallbacks
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument(); // Fallback revenue
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<OrderStatsCards data={mockData} />);

      expect(
        screen.getByRole('region', { name: /order statistics/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/total orders: 150/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/total revenue: \$25000\.00/i)
      ).toBeInTheDocument();
    });

    it('should have live region for dynamic updates', () => {
      render(<OrderStatsCards data={mockData} />);

      const liveRegion = screen.getByRole('region', {
        name: /order statistics/i,
      });
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
