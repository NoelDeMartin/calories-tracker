import type { BelongsToOneRelation, Relation } from 'soukai';

import Recipe from '@/models/Recipe';

import Model from './Meal.schema';

export default class Meal extends Model {

    public declare recipe?: Recipe;
    public declare relatedRecipe?: BelongsToOneRelation<Meal, Recipe, typeof Recipe>;

    public recipeRelationship(): Relation {
        return this.belongsToOne(Recipe);
    }

}
