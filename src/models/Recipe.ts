import type { BelongsToOneRelation, Relation } from 'soukai';
import { type ObjectsMap, arrayFilter, stringToSlug } from '@noeldemartin/utils';

import NutritionInformation from '@/models/NutritionInformation';
import { parseIngredient } from '@/utils/ingredients';
import type Ingredient from '@/models/Ingredient';
import type { IngredientBreakdown } from '@/utils/ingredients';

import Model from './Recipe.schema';

export type CaloriesBreakdown = ReturnType<Recipe['getCaloriesBreakdown']>;

export interface RecipeServingsBreakdown {
    original: string;
    quantity?: number;

    renderQuantity(quantity: number): string;
}

export default class Recipe extends Model {

    public static cloud = true;

    declare public nutrition?: NutritionInformation;
    declare public relatedNutrition: BelongsToOneRelation<Recipe, NutritionInformation, typeof NutritionInformation>;

    public get ingredientsBreakdown(): IngredientBreakdown[] {
        return this.ingredients.map(parseIngredient);
    }

    public get servingsBreakdown(): RecipeServingsBreakdown | null {
        const original = this.servings;
        const [quantityMatch] = original?.match(/[\d.,]+/) ?? [];

        if (!original || !quantityMatch) {
            return null;
        }

        return {
            original,
            quantity: parseFloat(quantityMatch),
            renderQuantity: (quantity) => original.replace(quantityMatch, quantity.toString()),
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getCaloriesBreakdown(ingredientsMultiplier: number, ingredientsBySlug: ObjectsMap<Ingredient>) {
        return arrayFilter(
            this.ingredientsBreakdown.map((breakdown) => {
                const slug = stringToSlug(
                    breakdown.template
                        .replace('{quantity}', '')
                        .trim()
                        .replace(/\s*\(optional\)/, ''),
                );

                const nutrition = ingredientsBySlug.get(slug)?.nutrition;

                return {
                    name:
                        typeof breakdown.quantity === 'number'
                            ? breakdown.renderQuantity(breakdown.quantity * ingredientsMultiplier)
                            : breakdown.original,
                    macroClass: nutrition?.macroClass,
                    ...nutrition?.getIngredientMacrosAndCalories(ingredientsMultiplier, breakdown),
                };
            }),
        );
    }

    public nutritionRelationship(): Relation {
        return this.belongsToOne(NutritionInformation, 'nutritionUrl').usingSameDocument();
    }

}
