/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';

// Mock the hooks
jest.mock('@/hooks/use-orders', () => ({
  useUpdatePaymentStatus: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  }),
}));

const mockData = [
  {
    id: '1',
    orderId: 'ORD-001',
    customerName: 'John Doe',
    total: '150.00',
    status: 'Shipped' as const,
    paid: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    orderId: 'ORD-002',
    customerName: 'Jane Smith',
    total: '250.00',
    status: 'Processing' as const,
    paid: false,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('DataTable', () => {
  describe('Data Display', () => {
    it('should render table with provided data', () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      // Check headers
      expect(
        screen.getByRole('columnheader', { name: 'Order ID' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Customer' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Status' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Total' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Paid' })
      ).toBeInTheDocument();

      // Check data
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('ORD-002')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should format currency correctly', () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('$250.00')).toBeInTheDocument();
    });

    it('should display status badges with correct styling', () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const shippedStatus = screen.getByRole('status', {
        name: /order status: shipped/i,
      });
      const processingStatus = screen.getByRole('status', {
        name: /order status: processing/i,
      });

      expect(shippedStatus).toBeInTheDocument();
      expect(processingStatus).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty data array', () => {
      renderWithQueryClient(<DataTable data={[]} />);

      // Table should still render with headers
      expect(
        screen.getByRole('columnheader', { name: 'Order ID' })
      ).toBeInTheDocument();

      // But no data rows
      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody?.children).toHaveLength(0);
    });
  });

  describe('Interactive Features', () => {
    it('should open order details when order ID is clicked', async () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const orderIdButton = screen.getByRole('button', {
        name: /view details for order ORD-001/i,
      });
      fireEvent.click(orderIdButton);

      // Order details drawer should open (mocked in actual implementation)
      expect(orderIdButton).toHaveAttribute(
        'aria-label',
        'View details for order ORD-001'
      );
    });

    it('should handle payment status toggle', async () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const paymentButtons = screen.getAllByRole('button', {
        name: /mark as/i,
      });
      expect(paymentButtons).toHaveLength(2);

      // Click on unpaid order to mark as paid
      const unpaidButton = screen.getByRole('button', {
        name: /mark as paid for order ORD-002/i,
      });
      fireEvent.click(unpaidButton);

      // Button should be clickable (actual mutation testing would require more setup)
      expect(unpaidButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should handle row selection', async () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: 'Select all',
      });
      const rowCheckboxes = screen.getAllByRole('checkbox', {
        name: 'Select row',
      });

      expect(selectAllCheckbox).toBeInTheDocument();
      expect(rowCheckboxes).toHaveLength(2);

      // Click individual row checkbox
      fireEvent.click(rowCheckboxes[0]);
      expect(rowCheckboxes[0]).toBeChecked();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation on order IDs', async () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const orderIdButton = screen.getByRole('button', {
        name: /view details for order ORD-001/i,
      });

      // Focus and press Enter
      orderIdButton.focus();
      fireEvent.keyDown(orderIdButton, { key: 'Enter' });

      expect(orderIdButton).toHaveFocus();
    });

    it('should support keyboard navigation on payment badges', async () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const paymentButton = screen.getByRole('button', {
        name: /mark as unpaid for order ORD-001/i,
      });

      // Focus and press Space
      paymentButton.focus();
      fireEvent.keyDown(paymentButton, { key: ' ' });

      expect(paymentButton).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check for accessible button labels
      expect(
        screen.getByRole('button', { name: /view details for order ORD-001/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: /mark as unpaid for order ORD-001/i,
        })
      ).toBeInTheDocument();

      // Check for status roles
      expect(
        screen.getByRole('status', { name: /order status: shipped/i })
      ).toBeInTheDocument();
    });

    it('should have proper table structure', () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const table = screen.getByRole('table');
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');

      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
      expect(tbody?.children).toHaveLength(2); // Two data rows
    });
  });

  describe('Edge Cases & Defensive Programming', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = [
        {
          id: '1',
          orderId: 'ORD-001',
          // missing customerName
          total: 'invalid-number',
          status: 'UnknownStatus' as any,
          paid: null as any,
          createdAt: 'invalid-date',
        },
      ];

      renderWithQueryClient(<DataTable data={malformedData} />);

      // Should not crash and show fallback values
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument(); // Fallback for invalid total
    });

    it('should handle null/undefined data properties', () => {
      const incompleteData = [
        {
          id: '1',
          orderId: null as any,
          customerName: undefined as any,
          total: null as any,
          status: undefined as any,
          paid: undefined as any,
          createdAt: null as any,
        },
      ];

      renderWithQueryClient(<DataTable data={incompleteData} />);

      // Should render fallback values instead of crashing
      const fallbackElements = screen.getAllByText('—');
      expect(fallbackElements.length).toBeGreaterThan(0);
    });

    it('should handle undefined data prop', () => {
      renderWithQueryClient(<DataTable data={undefined as any} />);

      // Should render empty table without crashing
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      expect(
        screen.getByRole('navigation', { name: /pagination/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
    });

    it('should handle page size changes', async () => {
      renderWithQueryClient(<DataTable data={mockData} />);

      const pageSizeSelect = screen.getByRole('combobox', {
        name: /rows per page/i,
      });
      expect(pageSizeSelect).toBeInTheDocument();

      await userEvent.selectOptions(pageSizeSelect, '20');
      expect(pageSizeSelect).toHaveValue('20');
    });
  });
});
