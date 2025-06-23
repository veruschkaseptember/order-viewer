import { cn } from '@/lib/utils';

describe('cn function', () => {
    it('should exist and be a function', () => {
        expect(typeof cn).toBe('function');
    });

    it('should merge classes correctly', () => {
        const result = cn('class1', 'class2');
        expect(result).toContain('class1');
        expect(result).toContain('class2');
    });
});
