import { array, number, object, optional, string } from '@zod/mini';
import { facade } from '@noeldemartin/utils';
import { Events } from '@aerogel/core';
import type { infer as ZInfer } from '@zod/mini';
import type { Nullable } from '@noeldemartin/utils';

import Service from './Nutritionix.state';

const FoodSchema = object({
    food_name: string(),
    nf_calories: optional(number()),
    nf_total_fat: optional(number()),
    nf_protein: optional(number()),
    nf_total_carbohydrate: optional(number()),
    serving_qty: optional(number()),
    serving_weight_grams: optional(number()),
});

const SearchSchema = object({
    foods: optional(array(FoodSchema)),
});

export interface NutritionixIngredient {
    name: string;
    serving: string;
    fat: Nullable<number>;
    protein: Nullable<number>;
    carbs: Nullable<number>;
    calories: Nullable<number>;
}

export class NutritionixService extends Service {

    public async getNutrition(ingredient: string): Promise<NutritionixIngredient | undefined> {
        const food = await this.findIngredient(ingredient);

        if (!food || !food.serving_weight_grams) {
            return;
        }

        return {
            name: food.food_name,
            serving: `${food.serving_weight_grams / (food.serving_qty ?? 1)} grams`,
            calories: food.nf_calories,
            protein: food.nf_protein,
            carbs: food.nf_total_carbohydrate,
            fat: food.nf_total_fat,
        };
    }

    protected async boot(): Promise<void> {
        Events.on('auth:logout', () => {
            this.appId = import.meta.env.VITE_NUTRITIONIX_APP_ID || null;
            this.appKey = import.meta.env.VITE_NUTRITIONIX_APP_KEY || null;
        });
    }

    private async findIngredient(query: string): Promise<ZInfer<typeof FoodSchema> | undefined> {
        if (!this.appId || !this.appKey) {
            throw new Error('Nutritionix app ID and key are not set');
        }

        const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': this.appId,
                'x-app-key': this.appKey,
            },
            body: JSON.stringify({ query }),
        });

        const data = SearchSchema.parse(await response.json());

        return data.foods?.[0];
    }

}

export default facade(NutritionixService);
