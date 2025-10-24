import { isObject } from '@noeldemartin/utils';

export interface NewMeal {
    id: 'new-meal';
    name: string;
}

export function isNewMeal(meal: unknown): meal is NewMeal {
    return isObject(meal) && meal.id === 'new-meal';
}
