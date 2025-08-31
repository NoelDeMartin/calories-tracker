import { round } from '@noeldemartin/utils';

import Model from './NutritionInformation.schema';

export default class NutritionInformation extends Model {

    private values: Record<string, number> | null = null;

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
