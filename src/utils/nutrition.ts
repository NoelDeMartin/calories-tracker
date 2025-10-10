import type { Nullable } from '@noeldemartin/utils';

export function getMacrosCalories(macros: {
    protein: Nullable<number>;
    carbs: Nullable<number>;
    fat: Nullable<number>;
}): {
    proteinPercentage: number;
    carbsPercentage: number;
    fatPercentage: number;
} {
    // Calculate atwater macros percentages
    // See https://en.wikipedia.org/wiki/Atwater_system#Modified_system
    const atwaterProtein = (macros.protein ?? 0) * 4;
    const atwaterCarbs = (macros.carbs ?? 0) * 4;
    const atwaterFat = (macros.fat ?? 0) * 9;
    const atwaterTotal = atwaterProtein + atwaterCarbs + atwaterFat;

    return {
        proteinPercentage: atwaterProtein / atwaterTotal,
        carbsPercentage: atwaterCarbs / atwaterTotal,
        fatPercentage: atwaterFat / atwaterTotal,
    };
}
