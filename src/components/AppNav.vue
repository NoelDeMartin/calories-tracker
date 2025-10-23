<template>
    <nav>
        <ul class="m-0 flex p-0">
            <li v-for="section in sections" :key="section.route">
                <RouterLink
                    class="block p-2 opacity-50 transition-opacity duration-200 hover:opacity-100"
                    :to="{ name: section.route }"
                    :class="{ 'rounded-full bg-amber-100 opacity-100': section.current }"
                >
                    <img :src="section.imageUrl" alt="" class="size-10">
                    <span class="sr-only">{{ section.label }}</span>
                </RouterLink>
            </li>
        </ul>
    </nav>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { Router } from '@aerogel/plugin-routing';
import { computed } from 'vue';

const ROUTES = ['home', 'history', 'ingredients', 'insights'];
const sections = computed(() => {
    const currentRoute = Router.currentRoute.value?.name;

    if (!currentRoute) {
        return [];
    }

    return ROUTES.map((route) => ({
        route,
        label: translate(`${route}.title`),
        current: route === currentRoute,
        imageUrl: `/img/nav/${route}.png`,
    }));
});
</script>
