import { Cloud } from '@aerogel/plugin-local-first';
import { facade } from '@noeldemartin/utils';
import { trackModels } from '@aerogel/plugin-soukai';

import Meal from '@/models/Meal';
import Ingredient from '@/models/Ingredient';

import Service from './Meals.state';

export class MealsService extends Service {

    protected async boot(): Promise<void> {
        await Cloud.register(Meal, { path: '/meals/' });
        await Cloud.register(Ingredient, { path: '/ingredients/' });
        await trackModels(Meal, { service: this, property: 'all' });
    }

}

export default facade(MealsService);
