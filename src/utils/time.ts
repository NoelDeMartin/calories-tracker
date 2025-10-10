const DAY_MILLISECONDS = 86400000;

export function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / DAY_MILLISECONDS;

    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
