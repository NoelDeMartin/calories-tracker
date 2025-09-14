import { array, nullable, number, object, optional, string } from '@zod/mini';
import { arraySorted, facade } from '@noeldemartin/utils';
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
    alt_measures: optional(
        array(
            object({
                serving_weight: optional(number()),
                measure: optional(string()),
                qty: optional(number()),
                seq: optional(nullable(number())),
            }),
        ),
    ),
    photo: optional(
        object({
            thumb: optional(string()),
        }),
    ),
});

const SearchSchema = object({
    foods: optional(array(FoodSchema)),
});

export interface NutritionixIngredient {
    name: string;
    imageUrl: Nullable<string>;
    fat: number;
    protein: number;
    carbs: number;
    calories: number;
    servingInGrams: number;
    servingInMilliliters: Nullable<number>;
}

export class NutritionixService extends Service {

    public async getNutrition(ingredient: string): Promise<NutritionixIngredient | undefined> {
        const foodInGrams = await this.findIngredient(`100g ${ingredient}`);
        const foodInMilliliters = await this.findIngredient(`100ml ${ingredient}`);

        if (!foodInGrams) {
            return;
        }

        const firstServingWeight = foodInGrams.alt_measures?.[0]?.serving_weight;
        const firstSeqServingWeight = arraySorted(
            foodInGrams.alt_measures?.filter(({ seq }) => seq !== null) ?? [],
            'seq',
            'asc',
        )?.[0]?.serving_weight;
        const servingInGrams = firstSeqServingWeight ?? firstServingWeight ?? 100;

        return {
            servingInGrams,
            imageUrl: foodInGrams.photo?.thumb,
            name: foodInGrams.food_name,
            calories: foodInGrams.nf_calories ? (foodInGrams.nf_calories / 100) * servingInGrams : 0,
            protein: foodInGrams.nf_protein ? (foodInGrams.nf_protein / 100) * servingInGrams : 0,
            carbs: foodInGrams.nf_total_carbohydrate ? (foodInGrams.nf_total_carbohydrate / 100) * servingInGrams : 0,
            fat: foodInGrams.nf_total_fat ? (foodInGrams.nf_total_fat / 100) * servingInGrams : 0,
            servingInMilliliters: foodInMilliliters?.serving_weight_grams
                ? (100 / foodInMilliliters.serving_weight_grams) * servingInGrams
                : 0,
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
