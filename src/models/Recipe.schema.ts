import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    rdfContext: 'https://schema.org/',
    fields: {
        name: {
            type: FieldType.String,
            required: true,
        },
        servings: {
            type: FieldType.String,
            rdfProperty: 'schema:recipeYield',
        },
    },
});
