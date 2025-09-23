import Meal from '@/models/Meal';
import { Solid } from '@aerogel/plugin-solid';
import { getTrackedModels, useModelCollection } from '@aerogel/plugin-soukai';
import { type ComputedRef, computed } from 'vue';

export function hasOnboarded(): boolean {
    const meals = getTrackedModels(Meal);

    return meals.length > 0 || Solid.hasLoggedIn();
}

export function useOnboarded(): ComputedRef<boolean> {
    const meals = useModelCollection(Meal);

    return computed(() => meals.value.length > 0 || Solid.hasLoggedIn());
}
