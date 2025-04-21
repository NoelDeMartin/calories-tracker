import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    rdfContext: 'https://schema.org/',
    rdfsClasses: ['Substance', 'MenuItem'],
    fields: {
        name: {
            type: FieldType.String,
            required: true,
        },
        nutritionUrl: {
            type: FieldType.Key,
            rdfProperty: 'nutrition',
        },
    },
});
