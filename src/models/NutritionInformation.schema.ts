import { FieldType } from 'soukai';
import { defineSolidModelSchema } from 'soukai-solid';

export default defineSolidModelSchema({
    history: true,
    tombstone: false,
    rdfContext: 'https://schema.org/',
    fields: {
        serving: {
            type: FieldType.String,
            rdfProperty: 'servingSize',
        },
        rawCalories: {
            type: FieldType.String,
            rdfProperty: 'calories',
        },
        rawProtein: {
            type: FieldType.String,
            rdfProperty: 'proteinContent',
        },
        rawCarbs: {
            type: FieldType.String,
            rdfProperty: 'carbohydrateContent',
        },
        rawFat: {
            type: FieldType.String,
            rdfProperty: 'fatContent',
        },
        alternateServingUrls: {
            type: FieldType.Array,
            items: FieldType.Key,
            rdfProperty: 'sameAs',
        },
    },
});
