import { Cloud } from '@aerogel/plugin-local-first';
import { facade } from '@noeldemartin/utils';
import { trackModels } from '@aerogel/plugin-soukai';

import Recipe from '@/models/Recipe';

import Service from './Cookbook.state';

export class CookbookService extends Service {

    protected async boot(): Promise<void> {
        await Cloud.register(Recipe);
        await trackModels(Recipe, { service: this, property: 'recipes' });
    }

}

export default facade(CookbookService);
