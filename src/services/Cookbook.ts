import { facade } from '@noeldemartin/utils';
import { trackModels } from '@aerogel/plugin-soukai';

import Recipe from '@/models/Recipe';

import Service from './Cookbook.state';

export class CookbookService extends Service {

    protected async boot(): Promise<void> {
        await trackModels(Recipe, {
            service: this,
            property: 'recipes',
            transform: (recipes) => recipes.filter((model) => !model.isSoftDeleted()),
        });
    }

}

export default facade(CookbookService);
