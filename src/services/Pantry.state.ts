import { defineServiceState } from '@aerogel/core';
import { shallowReactive } from 'vue';
import { ingredientSlugs } from '@/utils/ingredients';
import type Ingredient from '@/models/Ingredient';
import type { Slug } from '@noeldemartin/utils';

export default defineServiceState({
    name: 'pantry',
    initialState: () => ({
        ingredients: shallowReactive([] as Ingredient[]),
    }),
    computed: {
        ingredientsBySlug: ({ ingredients }) => {
            const bySlug = new Map<Slug, Ingredient>();

            for (const ingredient of ingredients) {
                const slugs = ingredientSlugs(ingredient);

                for (const slug of slugs) {
                    bySlug.set(slug, ingredient);
                }
            }

            return bySlug;
        },
    },
});
