/**
 * @jest-environment jsdom
 */
import { apiClient } from '@/lib/api-client';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchOrders', () => {
    it('should fetch orders successfully', async () => {
      const mockOrders = [
        {
          id: '1',
          orderId: 'ORD-001',
          customerName: 'John Doe',
          total: '100.00',
          status: 'Shipped',
          paid: true,
          createdAt: '2024-01-01',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockOrders,
          pagination: { total: 1, page: 1, pageSize: 10 },
        }),
      } as Response);

      const result = await apiClient.fetchOrders();

      expect(mockFetch).toHaveBeenCalledWith('/api/orders?page=1&pageSize=10');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toEqual(mockOrders);
      }
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.fetchOrders();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Failed to fetch orders');
        expect(result.error.userMessage).toBe(
          'Unable to load orders. Please check your connection.'
        );
      }
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Database connection failed' }),
      } as Response);

      const result = await apiClient.fetchOrders();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.userMessage).toBe(
          'Failed to load orders. Please try again.'
        );
      }
    });

    it('should handle invalid response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      } as Response);

      const result = await apiClient.fetchOrders();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.userMessage).toBe('Invalid response format');
      }
    });
  });

  describe('fetchOrderStats', () => {
    it('should fetch order statistics successfully', async () => {
      const mockStats = {
        overview: {
          totalOrders: 100,
          totalRevenue: 15000,
          averageOrderValue: 150,
        },
        statusBreakdown: [],
        paymentStatus: {
          paid: { count: 80, revenue: 12000 },
          unpaid: { count: 20, revenue: 3000 },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      } as Response);

      const result = await apiClient.fetchOrderStats();

      expect(mockFetch).toHaveBeenCalledWith('/api/orders/stats');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockStats);
      }
    });

    it('should provide fallback data for missing stats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response
      } as Response);

      const result = await apiClient.fetchOrderStats();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.overview.totalOrders).toBe(0);
        expect(result.data.paymentStatus.paid.count).toBe(0);
      }
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await apiClient.updatePaymentStatus('ORD-001', true);

      expect(mockFetch).toHaveBeenCalledWith('/api/orders/ORD-001/payment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: true }),
      });
      expect(result.success).toBe(true);
    });

    it('should validate orderId parameter', async () => {
      const result = await apiClient.updatePaymentStatus('', true);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.userMessage).toBe('Order ID is required');
      }
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should validate paid parameter', async () => {
      const result = await apiClient.updatePaymentStatus(
        'ORD-001',
        null as any
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.userMessage).toBe(
          'Payment status must be true or false'
        );
      }
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Error Classes', () => {
    it('should create ApiError with correct properties', () => {
      const error = new (apiClient as any).ApiError(
        'Test error',
        400,
        'Bad Request'
      );

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.statusText).toBe('Bad Request');
      expect(error.name).toBe('ApiError');
    });

    it('should create ValidationError with user message', () => {
      const error = new (apiClient as any).ValidationError(
        'Invalid input',
        'Please check your input'
      );

      expect(error.message).toBe('Invalid input');
      expect(error.userMessage).toBe('Please check your input');
      expect(error.name).toBe('ValidationError');
    });

    it('should create NetworkError with user message', () => {
      const error = new (apiClient as any).NetworkError('Connection failed');

      expect(error.message).toBe('Connection failed');
      expect(error.userMessage).toBe(
        'Unable to connect. Please check your internet connection.'
      );
      expect(error.name).toBe('NetworkError');
    });
  });
});
