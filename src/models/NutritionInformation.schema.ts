import { FieldType } from 'soukai';
import { defineSolidModelSchema } from 'soukai-solid';

export default defineSolidModelSchema({
    rdfContext: 'https://schema.org/',
    timestamps: false,
    fields: {
        calories: FieldType.String,
        protein: {
            type: FieldType.String,
            rdfProperty: 'schema:proteinContent',
        },
        carbs: {
            type: FieldType.String,
            rdfProperty: 'schema:carbohydrateContent',
        },
        fat: {
            type: FieldType.String,
            rdfProperty: 'schema:fatContent',
        },
    },
});
