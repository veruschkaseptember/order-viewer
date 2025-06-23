/**
 * @jest-environment jsdom
 */
import { formatCurrency } from '@/lib/utils';

describe('Utils', () => {
    describe('formatCurrency', () => {
        it('should format positive numbers correctly', () => {
            expect(formatCurrency(1234.56)).toBe('ZAR 1,234.56');
            expect(formatCurrency(0)).toBe('ZAR 0.00');
            expect(formatCurrency(999.9)).toBe('ZAR 999.90');
        });

        it('should handle edge cases', () => {
            expect(formatCurrency(0.01)).toBe('ZAR 0.01');
            expect(formatCurrency(1000000)).toBe('ZAR 1,000,000.00');
        });

        it('should handle invalid inputs gracefully', () => {
            expect(formatCurrency(NaN)).toBe('ZAR 0.00');
            expect(formatCurrency(undefined as any)).toBe('ZAR 0.00');
            expect(formatCurrency(null as any)).toBe('ZAR 0.00');
        });
    });
});
