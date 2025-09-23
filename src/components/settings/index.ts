import { defineSettings } from '@aerogel/core';

import Goals from './Goals.vue';
import Nutritionix from './Nutritionix.vue';

export default defineSettings([
    {
        component: Goals,
        priority: 100,
    },
    {
        component: Nutritionix,
        priority: 75,
    },
]);
