import Pantry from '@/services/Pantry';
import { arrayFilter, arraySorted } from '@noeldemartin/utils';
import { IngredientUnits } from '@/utils/ingredients';
import type Meal from '@/models/Meal';
import type { CaloriesBreakdown } from '@/models/Recipe';

export const mealIngredientUnits = [IngredientUnits.Grams, IngredientUnits.Milliliters, 'servings'] as const;
export type MealIngredientUnit = (typeof mealIngredientUnits)[number];

export interface MealIngredient {
    name: string;
    quantity: number;
    unit: MealIngredientUnit;
}

export function sortedMeals(meals: Meal[]): Meal[] {
    return arraySorted(
        meals,
        (a, b) => (a.consumedAt ?? a.createdAt).getTime() - (b.consumedAt ?? b.createdAt).getTime(),
    );
}

export function getMealIngredientsCaloriesBreakdown(ingredients: MealIngredient[]): CaloriesBreakdown {
    return arrayFilter(
        ingredients.map((mealIngredient) => {
            const ingredient = Pantry.ingredient(mealIngredient.name);
            const nutrition = ingredient?.nutrition;
            const multiplier = (function() {
                if (!nutrition) {
                    return;
                }

                switch (mealIngredient.unit) {
                    case 'grams':
                        if (!nutrition.servingInGrams) {
                            return;
                        }

                        return mealIngredient.quantity / nutrition.servingInGrams;
                    case 'milliliters':
                        if (!nutrition.servingInMilliliters) {
                            return;
                        }

                        return mealIngredient.quantity / nutrition.servingInMilliliters;
                    case 'servings':
                        return typeof mealIngredient.quantity === 'number' ? mealIngredient.quantity : 1;
                }
            })();
            const name = (function() {
                switch (mealIngredient.unit) {
                    case 'grams':
                        return `${mealIngredient.quantity}g ${mealIngredient.name}`;
                    case 'milliliters':
                        return `${mealIngredient.quantity}ml ${mealIngredient.name}`;
                    case 'servings':
                        return `${mealIngredient.quantity} ${mealIngredient.name}`;
                }
            })();

            if (!nutrition || !multiplier) {
                return { name, macroClass: 'bg-gray-400' };
            }

            return {
                name,
                macroClass: nutrition.macroClass,
                calories: typeof nutrition.calories === 'number' ? nutrition.calories * multiplier : null,
                protein: typeof nutrition.protein === 'number' ? nutrition.protein * multiplier : null,
                carbs: typeof nutrition.carbs === 'number' ? nutrition.carbs * multiplier : null,
                fat: typeof nutrition.fat === 'number' ? nutrition.fat * multiplier : null,
            };
        }),
    );
}
