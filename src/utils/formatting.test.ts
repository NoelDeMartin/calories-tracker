import { describe, expect, it } from 'vitest';
import { formatPercentage } from '@/utils/formatting';

describe('Formatting', () => {

    it('formats percentages', () => {
        expect(formatPercentage(0.01)).toBe('1%');
        expect(formatPercentage(0.5)).toBe('50%');
        expect(formatPercentage(0.9)).toBe('90%');
        expect(formatPercentage(0.7652, [0.7652, 0.1785, 0.0563])).toBe('76%');
        expect(formatPercentage(0.1785, [0.7652, 0.1785, 0.0563])).toBe('18%');
        expect(formatPercentage(0.0563, [0.7652, 0.1785, 0.0563])).toBe('6%');
    });

});
