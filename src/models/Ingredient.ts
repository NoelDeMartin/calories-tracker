import type { BelongsToOneRelation, Relation } from 'soukai';

import NutritionInformation from '@/models/NutritionInformation';

import Model from './Ingredient.schema';

export default class Ingredient extends Model {

    declare public nutrition?: NutritionInformation;
    declare public relatedNutrition: BelongsToOneRelation<
        Ingredient,
        NutritionInformation,
        typeof NutritionInformation
    >;

    public nutritionRelationship(): Relation {
        return this.belongsToOne(NutritionInformation, 'nutritionUrl').usingSameDocument();
    }

}
