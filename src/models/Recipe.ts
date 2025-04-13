import Model from './Recipe.schema';

export interface RecipeServingsBreakdown {
    original: string;
    quantity?: number;

    renderQuantity(quantity: number): string;
}

export default class Recipe extends Model {

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

}
