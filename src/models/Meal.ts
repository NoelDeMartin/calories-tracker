import { emitModelEvent } from 'soukai';
import type { BelongsToOneRelation, Relation } from 'soukai';

import Cookbook from '@/services/Cookbook';
import Recipe, { type CaloriesBreakdown } from '@/models/Recipe';
import NutritionInformation from '@/models/NutritionInformation';
import type { Nullable } from '@noeldemartin/utils';
import type { Nutrition } from '@/models/NutritionInformation';

import Model from './Meal.schema';

export default class Meal extends Model {

    public static cloud = true;

    public static boot(name?: string): void {
        super.boot(name);

        // FIXME these shouldn't be necessary.
        Recipe.on('updated', async (recipe) => {
            if (!recipe.meal) {
                return;
            }

            await emitModelEvent(recipe.meal, 'updated');
        });

        NutritionInformation.on('updated', async (nutrition) => {
            if (!nutrition.recipe?.meal) {
                return;
            }

            await emitModelEvent(nutrition.recipe.meal, 'updated');
        });
    }

    declare public recipe?: Recipe;
    declare public relatedRecipe: BelongsToOneRelation<Meal, Recipe, typeof Recipe>;

    public get nutrition(): Nutrition | null {
        const mealNutrition = this.recipe?.nutrition;

        if (!mealNutrition) {
            return null;
        }

        return {
            calories: mealNutrition.calories,
            protein: mealNutrition.protein,
            carbs: mealNutrition.carbs,
            fat: mealNutrition.fat,
        };
    }

    public get incomplete(): boolean {
        if (!this.nutrition?.calories) {
            return true;
        }

        if (this.recipe?.ingredients.length) {
            return this.recipe.hasIncompleteIngredients();
        }

        const recipeUrl = this.recipe?.externalUrls.find((url) => Cookbook.recipesByUrl.get(url));
        const linkedRecipe = recipeUrl ? Cookbook.recipesByUrl.require(recipeUrl) : null;
        const recipe = linkedRecipe ?? this.recipe;

        return !!recipe?.hasIncompleteIngredients();
    }

    public getCaloriesBreakdown(servings?: Nullable<number>): CaloriesBreakdown | undefined {
        if (this.recipe?.ingredients.length) {
            return this.recipe.getCaloriesBreakdown(servings);
        }

        const recipeUrl = this.recipe?.externalUrls.find((url) => Cookbook.recipesByUrl.get(url));
        const linkedRecipe = recipeUrl ? Cookbook.recipesByUrl.require(recipeUrl) : null;
        const recipe = linkedRecipe ?? this.recipe;
        const recipeQuantity = servings ?? recipe?.servingsBreakdown?.quantity ?? 1;
        const mealQuantity = this.recipe?.servingsBreakdown?.quantity ?? 1;

        return recipe?.getCaloriesBreakdown(mealQuantity / recipeQuantity);
    }

    public recipeRelationship(): Relation {
        return this.belongsToOne(Recipe).usingSameDocument().onDelete('cascade');
    }

}
