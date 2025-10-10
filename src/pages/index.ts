import { defineRoutes } from '@aerogel/plugin-routing';

import History from './History.vue';
import Home from './home/Home.vue';
import Ingredients from './ingredients/Ingredients.vue';
import Insights from './insights/Insights.vue';
import { hasOnboarded } from '@/utils/app';

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
        beforeEnter: (_, __, next) => {
            if (!hasOnboarded()) {
                next({ name: 'home' });

                return;
            }

            next();
        },
    },
    {
        name: 'ingredients',
        path: '/ingredients',
        component: Ingredients,
        beforeEnter: (_, __, next) => {
            if (!hasOnboarded()) {
                next({ name: 'home' });

                return;
            }

            next();
        },
    },
    {
        name: 'insights',
        path: '/insights',
        component: Insights,
        beforeEnter: (_, __, next) => {
            if (!hasOnboarded()) {
                next({ name: 'home' });

                return;
            }

            next();
        },
    },
]);
