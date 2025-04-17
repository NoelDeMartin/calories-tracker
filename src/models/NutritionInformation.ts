import Model from './NutritionInformation.schema';

export default class NutritionInformation extends Model {

    public caloriesValue(): number {
        return parseInt(this.calories?.replace('calories', '').trim() ?? '0');
    }

    public proteinValue(): number {
        return parseInt(this.protein?.replace('grams', '').trim() ?? '0');
    }

    public carbsValue(): number {
        return parseInt(this.carbs?.replace('grams', '').trim() ?? '0');
    }

    public fatValue(): number {
        return parseInt(this.fat?.replace('grams', '').trim() ?? '0');
    }

}
