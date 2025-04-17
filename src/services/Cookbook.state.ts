import { defineServiceState } from '@aerogel/core';
import { shallowReactive } from 'vue';

import type Recipe from '@/models/Recipe';

export default defineServiceState({
    name: 'cookbook',
    initialState: () => ({
        recipes: shallowReactive([] as Recipe[]),
    }),
    computed: {
        ready: ({ recipes }) => recipes.length > 0,
    },
});
