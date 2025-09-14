import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    history: true,
    tombstone: false,
    rdfContext: 'https://schema.org/',
    rdfsClasses: ['Substance', 'MenuItem'],
    fields: {
        name: {
            type: FieldType.String,
            required: true,
        },
        description: FieldType.String,
        imageUrl: {
            type: FieldType.Key,
            rdfProperty: 'image',
        },
        aliases: {
            type: FieldType.Array,
            items: FieldType.String,
            rdfProperty: 'alternateName',
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
