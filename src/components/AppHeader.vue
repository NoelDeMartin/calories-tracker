<template>
    <header
        v-if="$solid.hasLoggedIn() && !$solid.loginOngoing"
        class="mx-auto flex w-full max-w-screen-md items-center justify-between gap-2 pt-8"
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
            <h2 v-if="$cookbook.ready" class="text-lg text-gray-500">
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

const ROUTES = ['home', 'ingredients'];
const title = computed(() => {
    if (!Router.currentRoute.value) {
        return;
    }

    return translate(`${toString(Router.currentRoute.value.name)}.title`);
});
const options = computed(() => {
    const currentRoute = Router.currentRoute.value?.name;

    return ROUTES.map((route) => ({
        route,
        label: translate(`${route}.title`),
        class: route === currentRoute ? 'font-semibold' : undefined,
    }));
});
</script>
