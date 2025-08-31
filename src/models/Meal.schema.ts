import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    history: true,
    tombstone: false,
    rdfContext: 'https://schema.org/',
    rdfsClass: 'ConsumeAction',
    fields: {
        recipeUrl: {
            type: FieldType.Key,
            rdfProperty: 'object',
        },
    },
});
