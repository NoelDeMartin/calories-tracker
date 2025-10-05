import { parseIngredientName } from '@/utils/ingredients';
import { describe, expect, it } from 'vitest';

describe('Ingredients', () => {

    it('parses ingredient names', () => {
        expect(parseIngredientName('2 Eggplants')).toBe('Eggplants');
        expect(parseIngredientName('1L [Dashi](https://pod.example.com/recipes/dashi#it)')).toBe('Dashi');
        expect(parseIngredientName('1L <a href="https://pod.example.com/recipes/dashi#it">Dashi</a>')).toBe('Dashi');
    });

});
