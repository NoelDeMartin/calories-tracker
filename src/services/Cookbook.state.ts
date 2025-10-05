import { defineServiceState } from '@aerogel/core';
import { shallowReactive } from 'vue';
import { map } from '@noeldemartin/utils';
import type Recipe from '@/models/Recipe';

export default defineServiceState({
    name: 'cookbook',
    initialState: () => ({
        recipes: shallowReactive([] as Recipe[]),
    }),
    computed: {
        recipesByUrl: ({ recipes }) => map(recipes, 'url'),
    },
});
