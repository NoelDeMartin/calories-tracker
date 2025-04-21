import { defineRoutes } from '@aerogel/plugin-routing';
import { Solid } from '@aerogel/plugin-solid';

import Cookbook from '@/services/Cookbook';

import Home from './home/Home.vue';
import Ingredients from './Ingredients.vue';
import NotFound from './NotFound.vue';

export default defineRoutes([
    {
        name: 'home',
        path: '/',
        component: Home,
    },
    {
        name: 'ingredients',
        path: '/ingredients',
        component: Ingredients,
        beforeEnter(_, __, next) {
            if (Cookbook.ready && Solid.hasLoggedIn()) {
                return;
            }

            next({ name: 'home' });
        },
    },
    {
        name: '404',
        path: '/:pathMatch(.*)*',
        component: NotFound,
    },
]);
