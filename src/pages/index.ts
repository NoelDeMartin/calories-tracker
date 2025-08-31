import { defineRoutes } from '@aerogel/plugin-routing';
import { getTrackedModels } from '@aerogel/plugin-soukai';
import { Solid } from '@aerogel/plugin-solid';

import Recipe from '@/models/Recipe';

import Home from './home/Home.vue';
import Ingredients from './ingredients/Ingredients.vue';
import History from './History.vue';

export default defineRoutes([
    {
        name: 'home',
        path: '/',
        component: Home,
    },
    {
        name: 'history',
        path: '/history',
        component: History,
    },
    {
        name: 'ingredients',
        path: '/ingredients',
        component: Ingredients,
        beforeEnter(_, __, next) {
            const recipes = getTrackedModels(Recipe);

            if (recipes.length > 0 && Solid.hasLoggedIn()) {
                return;
            }

            next({ name: 'home' });
        },
    },
]);
