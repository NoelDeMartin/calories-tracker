import { defineServiceState } from '@aerogel/core';

export default defineServiceState({
    name: 'nutritionix',
    persist: ['appId', 'appKey'],
    initialState: () => ({
        appId: import.meta.env.VITE_NUTRITIONIX_APP_ID || (null as null | string),
        appKey: import.meta.env.VITE_NUTRITIONIX_APP_KEY || (null as null | string),
    }),
});
