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

        if (this.rawCalories) {
            values.calories = parseFloat(this.rawCalories.replace('calories', '').trim());
        }

        if (this.rawProtein) {
            values.protein = parseFloat(this.rawProtein.replace('grams', '').trim());
        }

        if (this.rawCarbs) {
            values.carbs = parseFloat(this.rawCarbs.replace('grams', '').trim());
        }

        if (this.rawFat) {
            values.fat = parseFloat(this.rawFat.replace('grams', '').trim());
        }

        return values;
    }

}
