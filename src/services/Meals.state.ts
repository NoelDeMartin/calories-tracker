import { defineServiceState } from '@aerogel/core';
import { shallowReactive } from 'vue';

import type Meal from '@/models/Meal';

export default defineServiceState({
    name: 'meals',
    initialState: () => ({
        all: shallowReactive([] as Meal[]),
    }),
});
