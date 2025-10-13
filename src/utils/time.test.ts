import { describe, expect, it } from 'vitest';
import { getWeekNumber } from '@/utils/time';

describe('time', () => {

    it('should get the week number', () => {
        expect(getWeekNumber(new Date(2018, 0, 1))).toBe(1);
        expect(getWeekNumber(new Date(2021, 0, 7))).toBe(1);
        expect(getWeekNumber(new Date(2025, 9, 10))).toBe(41);
        expect(getWeekNumber(new Date(2025, 8, 21))).toBe(38);
        expect(getWeekNumber(new Date(2025, 8, 22))).toBe(39);
        expect(getWeekNumber(new Date(2025, 8, 28))).toBe(39);
        expect(getWeekNumber(new Date(2025, 8, 29))).toBe(40);
    });

});
