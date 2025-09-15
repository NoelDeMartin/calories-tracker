import { defineServiceState } from '@aerogel/core';
import { shallowReactive } from 'vue';
import { type Slug, stringToSlug } from '@noeldemartin/utils';
import type Ingredient from '@/models/Ingredient';

function slugs(name: string): [Slug, Slug] {
    const singularSlug = stringToSlug(name).replace(/s$/, '') as Slug;
    const pluralSlug = `${singularSlug}s` as Slug;

    return [singularSlug, pluralSlug];
}

export default defineServiceState({
    name: 'pantry',
    initialState: () => ({
        ingredients: shallowReactive([] as Ingredient[]),
    }),
    computed: {
        ingredientsBySlug: ({ ingredients }) => {
            const bySlug = new Map<Slug, Ingredient>();
            const addIngredient = (name: string, ingredient: Ingredient) => {
                const [singularSlug, pluralSlug] = slugs(name);

                bySlug.set(singularSlug, ingredient);
                bySlug.set(pluralSlug, ingredient);
            };

            for (const ingredient of ingredients) {
                addIngredient(ingredient.name, ingredient);

                for (const alias of ingredient.aliases) {
                    addIngredient(alias, ingredient);
                }
            }

            return bySlug;
        },
    },
});
