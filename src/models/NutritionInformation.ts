import { round } from '@noeldemartin/utils';

import Ingredient from '@/models/Ingredient';
import Meal from '@/models/Meal';
import Recipe from '@/models/Recipe';
import type { IngredientBreakdown } from '@/utils/ingredients';

import Model from './NutritionInformation.schema';

export type ComputedValues = {
    macroClass: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingGrams?: number;
};

export default class NutritionInformation extends Model {

    private computedValues: ComputedValues | null = null;

    public static boot(name?: string): void {
        super.boot(name);

        // FIXME should be able to listen to nutrition events directly,
        // even if it the update is performed by a related model.
        Ingredient.on('updated', (ingredient) => {
            if (!ingredient.nutrition) {
                return;
            }

            ingredient.nutrition.computedValues = null;
        });

        Meal.on('updated', (meal) => {
            if (!meal.recipe?.nutrition) {
                return;
            }

            meal.recipe.nutrition.computedValues = null;
        });

        Recipe.on('updated', (recipe) => {
            if (!recipe.nutrition) {
                return;
            }

            recipe.nutrition.computedValues = null;
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

    public get macroClass(): string | undefined {
        return this.value('macroClass');
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

        this.computedValues = null;
    }

    private value<T extends keyof ComputedValues>(key: T): ComputedValues[T] {
        if (!this.computedValues) {
            this.computedValues = this.parseValues();
        }

        return this.computedValues[key];
    }

    private parseValues(): ComputedValues {
        const quantityMultiplier =
            this.serving && this.serving.includes('grams')
                ? 100 / parseFloat(this.serving.replace('grams', '').trim())
                : 1;

        const calories = this.rawCalories
            ? round(parseFloat(this.rawCalories.replace('calories', '').trim()) * quantityMultiplier, 2)
            : undefined;

        const protein = this.rawProtein
            ? round(parseFloat(this.rawProtein.replace('grams', '').trim()) * quantityMultiplier, 2)
            : undefined;

        const carbs = this.rawCarbs
            ? round(parseFloat(this.rawCarbs.replace('grams', '').trim()) * quantityMultiplier, 2)
            : undefined;

        const fat = this.rawFat
            ? round(parseFloat(this.rawFat.replace('grams', '').trim()) * quantityMultiplier, 2)
            : undefined;

        const servingGrams =
            this.serving && this.serving.includes('grams')
                ? parseFloat(this.serving.replace('grams', '').trim())
                : undefined;

        const atwaterProtein = (protein ?? 0) * 4;
        const atwaterCarbs = (carbs ?? 0) * 4;
        const atwaterFat = (fat ?? 0) * 9;
        const maxCalories = Math.max(atwaterProtein, atwaterCarbs, atwaterFat);
        const macroClass = {
            [atwaterProtein]: 'bg-protein-500',
            [atwaterCarbs]: 'bg-carbs-500',
            [atwaterFat]: 'bg-fat-500',
        }[maxCalories];

        return {
            calories,
            protein,
            carbs,
            fat,
            servingGrams,
            macroClass,
        };
    }

}
