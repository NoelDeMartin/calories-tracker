import { defineRoutes } from '@aerogel/plugin-routing';

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
    },
]);
