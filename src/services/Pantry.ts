import { facade, required, round, stringToSlug } from '@noeldemartin/utils';
import { trackModels } from '@aerogel/plugin-soukai';

import Nutritionix from '@/services/Nutritionix';
import Ingredient from '@/models/Ingredient';
import type { IngredientBreakdown } from '@/utils/ingredients';

import Service from './Pantry.state';

export class PantryService extends Service {

    protected async boot(): Promise<void> {
        await trackModels(Ingredient, {
            service: this,
            property: 'ingredients',
            transform: (ingredients) => ingredients.filter((model) => !model.isSoftDeleted()),
        });
    }

    public ingredient(nameOrBreakdown: string | IngredientBreakdown): Ingredient | undefined {
        const name =
            typeof nameOrBreakdown === 'string'
                ? nameOrBreakdown
                : nameOrBreakdown.template
                    .replace('{quantity}', '')
                    .trim()
                    .replace(/\s*\(optional\)/, '');

        return this.ingredientsBySlug.get(stringToSlug(name));
    }

    public async resolveIngredient(nameOrBreakdown: IngredientBreakdown): Promise<Ingredient> {
        const name =
            typeof nameOrBreakdown === 'string'
                ? nameOrBreakdown
                : nameOrBreakdown.template
                    .replace('{quantity}', '')
                    .trim()
                    .replace(/\s*\(optional\)/, '');

        const slug = stringToSlug(name);

        if (this.ingredientsBySlug.has(slug)) {
            return required(this.ingredientsBySlug.get(slug));
        }

        const nutrition = await Nutritionix.getNutrition(name);
        const ingredient = new Ingredient({ name, imageUrl: nutrition?.imageUrl });

        if (nutrition) {
            ingredient.externalUrls = [`https://www.nutritionix.com/food/${stringToSlug(nutrition.name)}`];

            const ingredientNutrition = ingredient.relatedNutrition.attach({
                serving: `${round(nutrition.servingInGrams, 2)} grams`,
                rawCalories:
                    typeof nutrition.calories === 'number' ? `${round(nutrition.calories)} calories` : undefined,
                rawProtein: typeof nutrition.protein === 'number' ? `${round(nutrition.protein, 2)} grams` : undefined,
                rawCarbs: typeof nutrition.carbs === 'number' ? `${round(nutrition.carbs, 2)} grams` : undefined,
                rawFat: typeof nutrition.fat === 'number' ? `${round(nutrition.fat, 2)} grams` : undefined,
            });

            if (nutrition.servingInMilliliters) {
                ingredientNutrition.relatedAlternateServings.attach({
                    serving: `${round(nutrition.servingInMilliliters, 2)} milliliters`,
                });
            }
        }

        await ingredient.save();

        return ingredient;
    }

}

export default facade(PantryService);
