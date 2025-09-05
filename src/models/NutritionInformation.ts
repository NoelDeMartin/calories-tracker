import { round } from '@noeldemartin/utils';

import Ingredient from '@/models/Ingredient';
import Meal from '@/models/Meal';
import Recipe from '@/models/Recipe';
import type { IngredientBreakdown } from '@/utils/ingredients';

import Model from './NutritionInformation.schema';

export default class NutritionInformation extends Model {

    private values: Record<string, number> | null = null;

    public static boot(name?: string): void {
        super.boot(name);

        // FIXME should be able to listen to nutrition events directly,
        // even if it the update is performed by a related model.
        Ingredient.on('updated', (ingredient) => {
            if (!ingredient.nutrition) {
                return;
            }

            ingredient.nutrition.values = null;
        });

        Meal.on('updated', (meal) => {
            if (!meal.recipe?.nutrition) {
                return;
            }

            meal.recipe.nutrition.values = null;
        });

        Recipe.on('updated', (recipe) => {
            if (!recipe.nutrition) {
                return;
            }

            recipe.nutrition.values = null;
        });
    }

    public get calories(): number | undefined {
        return this.value('calories');
    }

    public get protein(): number | undefined {
        return this.value('protein');
    }

    public get carbs(): number | undefined {
        return this.value('carbs');
    }

    public get fat(): number | undefined {
        return this.value('fat');
    }

    public get servingGrams(): number | undefined {
        return this.value('servingGrams');
    }

    public getMacroClass(): string {
        const atwaterProtein = (this.protein ?? 0) * 4;
        const atwaterCarbs = (this.carbs ?? 0) * 4;
        const atwaterFat = (this.fat ?? 0) * 9;
        const maxCalories = Math.max(atwaterProtein, atwaterCarbs, atwaterFat);

        return {
            [atwaterProtein]: 'bg-protein-500',
            [atwaterCarbs]: 'bg-carbs-500',
            [atwaterFat]: 'bg-fat-500',
        }[maxCalories];
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getIngredientMacrosAndCalories(servings: number, breakdown: IngredientBreakdown) {
        let multiplier: number;
        const quantity = typeof breakdown.quantity === 'number' ? breakdown.quantity : 1;

        if (breakdown.unit === 'grams') {
            multiplier = servings * (quantity / 100);
        } else if (!breakdown.unit) {
            if (!this.servingGrams) {
                return null;
            }

            multiplier = (servings * (quantity * this.servingGrams)) / 100;
        } else {
            return null;
        }

        return {
            calories: typeof this.calories === 'number' ? this.calories * multiplier : null,
            protein: typeof this.protein === 'number' ? this.protein * multiplier : null,
            carbs: typeof this.carbs === 'number' ? this.carbs * multiplier : null,
            fat: typeof this.fat === 'number' ? this.fat * multiplier : null,
        };
    }

    protected async afterSave(): Promise<void> {
        await super.afterSave();

        this.values = null;
    }

    private value(key: string): number | undefined {
        if (!this.values) {
            this.values = this.parseValues();
        }

        return this.values[key];
    }

    private parseValues(): Record<string, number> {
        const values: Record<string, number> = {};
        const quantityMultiplier =
            this.serving && this.serving.includes('grams')
                ? 100 / parseFloat(this.serving.replace('grams', '').trim())
                : 1;

        if (this.rawCalories) {
            values.calories = round(
                parseFloat(this.rawCalories.replace('calories', '').trim()) * quantityMultiplier,
                2,
            );
        }

        if (this.rawProtein) {
            values.protein = round(parseFloat(this.rawProtein.replace('grams', '').trim()) * quantityMultiplier, 2);
        }

        if (this.rawCarbs) {
            values.carbs = round(parseFloat(this.rawCarbs.replace('grams', '').trim()) * quantityMultiplier, 2);
        }

        if (this.rawFat) {
            values.fat = round(parseFloat(this.rawFat.replace('grams', '').trim()) * quantityMultiplier, 2);
        }

        if (this.serving && this.serving.includes('grams')) {
            values.servingGrams = parseFloat(this.serving.replace('grams', '').trim());
        }

        return values;
    }

}
