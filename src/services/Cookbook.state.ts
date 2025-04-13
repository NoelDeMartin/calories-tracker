import { defineServiceState } from '@aerogel/core';
import { shallowRef } from 'vue';

import type Recipe from '@/models/Recipe';

export default defineServiceState({
    name: 'cookbook',
    initialState: () => ({
        recipes: shallowRef([] as Recipe[]),
    }),
    computed: {
        ready: ({ recipes }) => recipes.length > 0,
    },
});
