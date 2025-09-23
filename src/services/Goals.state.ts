import { defineServiceState } from '@aerogel/core';
import type { Nullable } from '@noeldemartin/utils';

export default defineServiceState({
    name: 'goals',
    persist: ['calories', 'protein', 'carbs', 'fat'],
    initialState: () => ({
        calories: null as Nullable<number>,
        protein: null as Nullable<number>,
        carbs: null as Nullable<number>,
        fat: null as Nullable<number>,
    }),
});
