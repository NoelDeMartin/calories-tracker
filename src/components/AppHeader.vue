<template>
    <header
        v-if="onboarded"
        class="px-edge max-w-screen-content mx-auto flex w-full items-center justify-between gap-2 pt-8"
        :style="$route.name === 'ingredients' && '--breakpoint-content: 1200px'"
    >
        <div>
            <div class="flex flex-row items-center">
                <DropdownMenu align="start" :options>
                    <Button
                        variant="ghost"
                        class="clickable -ml-1.5 w-5 p-0"
                        :aria-label="$t('app.navigation')"
                        :title="$t('app.navigation')"
                    >
                        <i-zondicons-dots-horizontal-triple class="size-5" />
                    </Button>
                </DropdownMenu>
                <h1 class="text-2xl font-semibold tracking-tight">
                    {{ $t('app.title') }}
                </h1>
            </div>
            <h2 v-if="onboarded" class="text-lg text-gray-500">
                {{ title }}
            </h2>
        </div>
        <div class="grow" />
        <ErrorLogs />
        <Account />
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Router } from '@aerogel/plugin-routing';
import { toString } from '@noeldemartin/utils';
import { translate } from '@aerogel/core';
import { useOnboarded } from '@/utils/app';

const ROUTES = ['home', 'history', 'ingredients'];
const onboarded = useOnboarded();
const title = computed(() => {
    if (!Router.currentRoute.value?.name) {
        return;
    }

    return translate(`${toString(Router.currentRoute.value.name)}.title`);
});
const options = computed(() => {
    const currentRoute = Router.currentRoute.value?.name;

    if (!currentRoute) {
        return [];
    }

    return ROUTES.map((route) => ({
        route,
        label: translate(`${route}.title`),
        class: route === currentRoute ? 'font-semibold' : undefined,
    }));
});
</script>
