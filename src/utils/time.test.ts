import { describe, expect, it } from 'vitest';
import { getWeekNumber } from '@/utils/time';

describe('time', () => {

    it('should get the week number', () => {
        expect(getWeekNumber(new Date(2021, 0, 1))).toBe(1);
        expect(getWeekNumber(new Date(2021, 7, 15))).toBe(34);
        expect(getWeekNumber(new Date(2025, 9, 10))).toBe(41);
    });

});
