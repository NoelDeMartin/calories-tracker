import { FieldType } from 'soukai';
import { defineSolidModelSchema } from 'soukai-solid';

export default defineSolidModelSchema({
    rdfContext: 'https://schema.org/',
    timestamps: false,
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
    },
});
