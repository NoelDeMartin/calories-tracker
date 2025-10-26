import { arrayFilter } from '@noeldemartin/utils';
import type { Nullable } from '@noeldemartin/utils';
import type { BelongsToOneRelation, HasOneRelation, Relation } from 'soukai';

import Pantry from '@/services/Pantry';
import NutritionInformation from '@/models/NutritionInformation';
import Meal from '@/models/Meal';
import { parseIngredient } from '@/utils/ingredients';
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
    declare public meal?: Meal;
    declare public relatedMeal: HasOneRelation<Meal, Recipe, typeof Recipe>;

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

    public hasIncompleteIngredients(): boolean {
        return this.ingredientsBreakdown.some(
            (breakdown) => typeof Pantry.ingredient(breakdown)?.nutrition?.calories === 'undefined',
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getCaloriesBreakdown(ingredientsMultiplier?: Nullable<number>) {
        const multiplier = ingredientsMultiplier ?? 1;

        return arrayFilter(
            this.ingredientsBreakdown.map((breakdown) => {
                const nutrition = Pantry.ingredient(breakdown)?.nutrition;

                return {
                    name:
                        typeof breakdown.quantity === 'number'
                            ? breakdown.renderQuantity(breakdown.quantity * multiplier)
                            : breakdown.original,
                    macroClass: nutrition?.macroClass,
                    ...nutrition?.getIngredientMacrosAndCalories(multiplier, breakdown),
                };
            }),
        );
    }

    public nutritionRelationship(): Relation {
        return this.belongsToOne(NutritionInformation, 'nutritionUrl').usingSameDocument().onDelete('cascade');
    }

    public mealRelationship(): Relation {
        return this.hasOne(Meal, 'recipeUrl').usingSameDocument(true).onDelete('cascade');
    }

}
