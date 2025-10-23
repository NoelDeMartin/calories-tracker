import { facade, required, stringToSlug } from '@noeldemartin/utils';
import { trackModels } from '@aerogel/plugin-soukai';

import Nutritionix from '@/services/Nutritionix';
import Ingredient from '@/models/Ingredient';
import { type IngredientBreakdown, parseIngredientName } from '@/utils/ingredients';

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
        return this.ingredientsBySlug.get(stringToSlug(parseIngredientName(nameOrBreakdown)));
    }

    public async resolveIngredient(nameOrBreakdown: IngredientBreakdown): Promise<Ingredient> {
        const name = parseIngredientName(nameOrBreakdown);
        const slug = stringToSlug(name);

        if (this.ingredientsBySlug.has(slug)) {
            return required(this.ingredientsBySlug.get(slug));
        }

        const nutrition = await Nutritionix.getNutrition(name);
        const ingredient = new Ingredient({ name });

        nutrition && ingredient.setNutritionAttributes(nutrition);

        await ingredient.save();

        return ingredient;
    }

}

export default facade(PantryService);
