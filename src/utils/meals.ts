import { arraySorted } from '@noeldemartin/utils';
import type Meal from '@/models/Meal';

export function sortedMeals(meals: Meal[]): Meal[] {
    return arraySorted(
        meals,
        (a, b) => (a.consumedAt ?? a.createdAt).getTime() - (b.consumedAt ?? b.createdAt).getTime(),
    );
}
