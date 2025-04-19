import i18n from '@aerogel/plugin-i18n';
import soukai from '@aerogel/plugin-soukai';
import solid from '@aerogel/plugin-solid';
import localFirst from '@aerogel/plugin-local-first';
import routing from '@aerogel/plugin-routing';
import { bootstrap } from '@aerogel/core';

import './assets/css/main.css';
import App from './App.vue';
import routes from './pages';
import { services } from './services';

bootstrap(App, {
    services,
    plugins: [
        i18n({ messages: import.meta.glob('@/lang/*.yaml') }),
        routing({ routes }),
        soukai({ models: import.meta.glob(['@/models/*', '!**/*.test.ts'], { eager: true }) }),
        solid(),
        localFirst(),
    ],
});
