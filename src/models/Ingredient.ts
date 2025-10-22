import type { BelongsToOneRelation, Relation } from 'soukai';

import NutritionInformation from '@/models/NutritionInformation';
import { round, stringToSlug } from '@noeldemartin/utils';
import type { NutritionixIngredient } from '@/services/Nutritionix';

import Model from './Ingredient.schema';

export default class Ingredient extends Model {

    public static cloud = true;

    declare public nutrition?: NutritionInformation;
    declare public relatedNutrition: BelongsToOneRelation<
        Ingredient,
        NutritionInformation,
        typeof NutritionInformation
    >;

    public nutritionRelationship(): Relation {
        return this.belongsToOne(NutritionInformation, 'nutritionUrl').usingSameDocument().onDelete('cascade');
    }

    public setNutritionAttributes(nutrition: NutritionixIngredient): void {
        this.imageUrl = nutrition?.imageUrl ?? undefined;
        this.externalUrls = [`https://www.nutritionix.com/food/${stringToSlug(nutrition.name)}`];

        const ingredientNutrition = this.nutrition ?? this.relatedNutrition.attach();

        ingredientNutrition.setAttributes({
            serving: `${round(nutrition.servingInGrams, 2)} grams`,
            rawCalories: typeof nutrition.calories === 'number' ? `${round(nutrition.calories)} calories` : undefined,
            rawProtein: typeof nutrition.protein === 'number' ? `${round(nutrition.protein, 2)} grams` : undefined,
            rawCarbs: typeof nutrition.carbs === 'number' ? `${round(nutrition.carbs, 2)} grams` : undefined,
            rawFat: typeof nutrition.fat === 'number' ? `${round(nutrition.fat, 2)} grams` : undefined,
        });

        nutrition.servingInMilliliters &&
            ingredientNutrition.relatedAlternateServings.attach({
                serving: `${round(nutrition.servingInMilliliters, 2)} milliliters`,
            });
    }

}
