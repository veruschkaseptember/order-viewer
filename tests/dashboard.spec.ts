import { test, expect } from '@playwright/test';

test.describe('Order Viewer Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
    });

    test('should load dashboard with order statistics', async ({ page }) => {
        // Wait for the page to load
        await expect(page.locator('[role="region"][aria-label*="Order statistics"]')).toBeVisible();

        // Check that all stat cards are present
        await expect(page.getByText('Total Orders')).toBeVisible();
        await expect(page.getByText('Total Revenue')).toBeVisible();
        await expect(page.getByText('Paid Orders')).toBeVisible();
        await expect(page.getByText('Unpaid Orders')).toBeVisible();
    });

    test('should display data table with orders', async ({ page }) => {
        // Wait for the data table to load
        await expect(page.locator('table')).toBeVisible();

        // Check for table headers
        await expect(page.getByRole('columnheader', { name: 'Order ID' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Paid' })).toBeVisible();
    });

    test('should filter orders using search', async ({ page }) => {
        // Wait for search input to be visible
        const searchInput = page.getByRole('textbox', { name: /search orders/i });
        await expect(searchInput).toBeVisible();

        // Type in search input
        await searchInput.fill('ORD-001');

        // Wait for table to update (debounced search)
        await page.waitForTimeout(500);

        // Check that filtered results are shown
        const tableRows = page.locator('tbody tr');
        await expect(tableRows).toHaveCount(1);
    });

    test('should toggle payment status', async ({ page }) => {
        // Wait for table to load
        await expect(page.locator('table')).toBeVisible();

        // Find first payment status badge and click it
        const firstPaymentBadge = page.locator('[role="button"][aria-pressed]').first();
        await expect(firstPaymentBadge).toBeVisible();

        // Get initial state
        const initialState = await firstPaymentBadge.getAttribute('aria-pressed');

        // Click to toggle
        await firstPaymentBadge.click();

        // Wait for update and verify state changed
        await page.waitForTimeout(1000);
        const newState = await firstPaymentBadge.getAttribute('aria-pressed');
        expect(newState).not.toBe(initialState);
    });

    test('should open order details panel', async ({ page }) => {
        // Wait for table to load
        await expect(page.locator('table')).toBeVisible();

        // Click on first order ID link
        const firstOrderLink = page.locator('table tbody tr:first-child button').first();
        await expect(firstOrderLink).toBeVisible();
        await firstOrderLink.click();

        // Check that order details panel opens
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('Order Details')).toBeVisible();
    });

    test('should use filters', async ({ page }) => {
        // Open filter panel
        const filterButton = page.getByRole('button', { name: /filters/i });
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        // Wait for filter panel to open
        await expect(page.getByText('Filter Options')).toBeVisible();

        // Use status filter
        const statusSelect = page.locator('select[name*="status"]').first();
        await statusSelect.selectOption('Shipped');

        // Wait for table to update
        await page.waitForTimeout(500);

        // Verify that only shipped orders are shown
        const statusBadges = page.locator('[role="status"][aria-label*="Order status"]');
        const count = await statusBadges.count();

        for (let i = 0; i < count; i++) {
            const badge = statusBadges.nth(i);
            await expect(badge).toContainText('Shipped');
        }
    });

    test('should handle pagination', async ({ page }) => {
        // Wait for pagination controls
        await expect(page.getByRole('navigation', { name: /pagination/i })).toBeVisible();

        // Check current page indicator
        await expect(page.getByText('Page 1 of')).toBeVisible();

        // Go to next page if available
        const nextButton = page.getByRole('button', { name: /next page/i });
        if (await nextButton.isEnabled()) {
            await nextButton.click();
            await expect(page.getByText('Page 2 of')).toBeVisible();
        }
    });

    test('should be keyboard accessible', async ({ page }) => {
        // Tab through interactive elements
        await page.keyboard.press('Tab'); // Search input
        await expect(page.locator(':focus')).toHaveAttribute('role', 'textbox');

        await page.keyboard.press('Tab'); // Filter button
        await expect(page.locator(':focus')).toHaveAttribute('role', 'button');

        // Navigate to table and use arrow keys
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab'); // Should reach table

        // Test Enter key on order ID
        const focusedElement = page.locator(':focus');
        if (await focusedElement.getAttribute('aria-label')?.then(label => label?.includes('View details'))) {
            await page.keyboard.press('Enter');
            await expect(page.getByRole('dialog')).toBeVisible();
        }
    });

    test('should handle loading states', async ({ page }) => {
        // Intercept API calls to simulate slow loading
        await page.route('/api/orders', async route => {
            await page.waitForTimeout(2000); // Simulate slow response
            await route.continue();
        });

        await page.goto('/dashboard');

        // Check for loading skeletons
        await expect(page.locator('[role="status"][aria-label*="Loading"]')).toBeVisible();
    });

    test('should handle error states gracefully', async ({ page }) => {
        // Intercept API calls to simulate errors
        await page.route('/api/orders', async route => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' }),
            });
        });

        await page.goto('/dashboard');

        // Check for error message
        await expect(page.getByText(/error/i)).toBeVisible();
    });
});
