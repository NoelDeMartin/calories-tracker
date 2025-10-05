import { type Nullable, round } from '@noeldemartin/utils';
import type { BelongsToManyRelation, Relation } from 'soukai';

import Ingredient from '@/models/Ingredient';
import Meal from '@/models/Meal';
import Recipe from '@/models/Recipe';
import type { IngredientBreakdown } from '@/utils/ingredients';

import Model from './NutritionInformation.schema';

export interface Nutrition {
    calories: Nullable<number>;
    fat: Nullable<number>;
    protein: Nullable<number>;
    carbs: Nullable<number>;
}

export type ComputedValues = {
    macroClass: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingInGrams?: number;
    servingInMilliliters?: number;
};

export default class NutritionInformation extends Model {

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

    private computedValues: ComputedValues | null = null;
    declare public alternateServings?: NutritionInformation[];
    declare public relatedAlternateServings: BelongsToManyRelation<
        NutritionInformation,
        NutritionInformation,
        typeof NutritionInformation
    >;

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

    public get servingInGrams(): number | undefined {
        return this.value('servingInGrams');
    }

    public get servingInMilliliters(): number | undefined {
        return this.value('servingInMilliliters');
    }

    public get macroClass(): string | undefined {
        return this.value('macroClass');
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getIngredientMacrosAndCalories(servings: number, breakdown: IngredientBreakdown) {
        let multiplier: number;
        const quantity = typeof breakdown.quantity === 'number' ? breakdown.quantity : 1;

        if (breakdown.unit === 'grams') {
            if (!this.servingInGrams) {
                return null;
            }

            multiplier = servings * (quantity / this.servingInGrams);
        } else if (breakdown.unit === 'milliliters') {
            if (!this.servingInMilliliters) {
                return null;
            }

            multiplier = servings * (quantity / this.servingInMilliliters);
        } else if (!breakdown.unit) {
            multiplier = quantity;
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

    public alternateServingsRelationship(): Relation {
        return this.belongsToMany(NutritionInformation, 'alternateServingUrls')
            .usingSameDocument(true)
            .onDelete('cascade');
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
        const calories = this.rawCalories
            ? round(parseFloat(this.rawCalories.replace('calories', '').trim()), 2)
            : undefined;

        const protein = this.rawProtein ? round(parseFloat(this.rawProtein.replace('grams', '').trim()), 2) : undefined;

        const carbs = this.rawCarbs ? round(parseFloat(this.rawCarbs.replace('grams', '').trim()), 2) : undefined;

        const fat = this.rawFat ? round(parseFloat(this.rawFat.replace('grams', '').trim()), 2) : undefined;

        const servingInGrams =
            this.serving && this.serving.includes('grams')
                ? parseFloat(this.serving.replace('grams', '').trim())
                : undefined;

        const millilitersServing = this.alternateServings?.find((serving) =>
            serving.serving?.includes('milliliters'))?.serving;
        const servingInMilliliters = millilitersServing
            ? parseFloat(millilitersServing.replace('milliliters', '').trim())
            : undefined;

        const atwaterProtein = (protein ?? 0) * 4;
        const atwaterCarbs = (carbs ?? 0) * 4;
        const atwaterFat = (fat ?? 0) * 9;
        const maxCalories = Math.max(atwaterProtein, atwaterCarbs, atwaterFat);
        const macroClass =
            typeof protein !== 'number' && typeof carbs !== 'number' && typeof fat !== 'number'
                ? 'bg-gray-400'
                : {
                    [atwaterProtein]: 'bg-protein-500',
                    [atwaterCarbs]: 'bg-carbs-500',
                    [atwaterFat]: 'bg-fat-500',
                }[maxCalories];

        return {
            calories,
            protein,
            carbs,
            fat,
            servingInGrams,
            servingInMilliliters,
            macroClass,
        };
    }

}
