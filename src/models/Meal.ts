import type { BelongsToOneRelation, Relation } from 'soukai';

import Recipe from '@/models/Recipe';

import Model from './Meal.schema';

export default class Meal extends Model {

    declare public recipe?: Recipe;
    declare public relatedRecipe: BelongsToOneRelation<Meal, Recipe, typeof Recipe>;

    public recipeRelationship(): Relation {
        return this.belongsToOne(Recipe).usingSameDocument();
    }

}
