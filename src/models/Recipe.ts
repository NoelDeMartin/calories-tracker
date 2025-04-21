import type { BelongsToOneRelation, Relation } from 'soukai';

import NutritionInformation from '@/models/NutritionInformation';
import { parseIngredient } from '@/utils/ingredients';
import type { IngredientBreakdown } from '@/utils/ingredients';

import Model from './Recipe.schema';

export interface RecipeServingsBreakdown {
    original: string;
    quantity?: number;

    renderQuantity(quantity: number): string;
}

export default class Recipe extends Model {

    declare public nutrition?: NutritionInformation;
    declare public relatedNutrition: BelongsToOneRelation<Recipe, NutritionInformation, typeof NutritionInformation>;

    public get ingredientsBreakdown(): IngredientBreakdown[] {
        return this.ingredients.map(parseIngredient);
    }

    public get servingsBreakdown(): RecipeServingsBreakdown | null {
        const original = this.servings;
        const [quantityMatch] = original?.match(/\d+/) ?? [];

        if (!original || !quantityMatch) {
            return null;
        }

        return {
            original,
            quantity: parseInt(quantityMatch),
            renderQuantity: (quantity) => original.replace(quantityMatch, quantity.toString()),
        };
    }

    public nutritionRelationship(): Relation {
        return this.belongsToOne(NutritionInformation, 'nutritionUrl').usingSameDocument();
    }

}
