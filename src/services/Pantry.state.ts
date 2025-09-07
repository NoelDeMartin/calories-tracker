import { defineServiceState } from '@aerogel/core';
import { shallowReactive } from 'vue';
import { type Slug, stringToSlug } from '@noeldemartin/utils';
import type Ingredient from '@/models/Ingredient';

export default defineServiceState({
    name: 'pantry',
    initialState: () => ({
        ingredients: shallowReactive([] as Ingredient[]),
    }),
    computed: {
        ingredientsBySlug: ({ ingredients }) => {
            const bySlug = new Map<Slug, Ingredient>();

            for (const ingredient of ingredients) {
                bySlug.set(stringToSlug(ingredient.name), ingredient);

                for (const alias of ingredient.aliases) {
                    bySlug.set(stringToSlug(alias), ingredient);
                }
            }

            return bySlug;
        },
    },
});
