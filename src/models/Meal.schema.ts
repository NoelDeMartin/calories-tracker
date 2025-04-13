import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    fields: {
        recipeUrl: FieldType.Key,
        calories: FieldType.Number,
        protein: FieldType.Number,
        carbs: FieldType.Number,
        fat: FieldType.Number,
    },
});
