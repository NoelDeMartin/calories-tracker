import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    rdfContext: 'https://schema.org/',
    timestamps: false,
    fields: {
        name: {
            type: FieldType.String,
            required: true,
        },
        servings: {
            type: FieldType.String,
            rdfProperty: 'schema:recipeYield',
        },
        nutritionUrl: {
            type: FieldType.Key,
            rdfProperty: 'schema:nutrition',
        },
        sameAs: {
            type: FieldType.Array,
            items: FieldType.Key,
        },
    },
});
