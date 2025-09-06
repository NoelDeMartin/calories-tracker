import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    history: true,
    tombstone: false,
    rdfContext: 'https://schema.org/',
    fields: {
        name: {
            type: FieldType.String,
            required: true,
        },
        servings: {
            type: FieldType.String,
            rdfProperty: 'recipeYield',
        },
        ingredients: {
            type: FieldType.Array,
            items: FieldType.String,
            rdfProperty: 'schema:recipeIngredient',
        },
        nutritionUrl: {
            type: FieldType.Key,
            rdfProperty: 'nutrition',
        },
        externalUrls: {
            type: FieldType.Array,
            items: FieldType.Key,
            rdfProperty: 'sameAs',
        },
    },
});
