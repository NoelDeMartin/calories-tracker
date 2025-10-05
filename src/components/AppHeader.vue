<template>
    <header
        v-if="onboarded"
        class="px-edge max-w-screen-content mx-auto flex w-full items-center justify-between gap-2 pt-8"
        :style="$route.name === 'ingredients' && '--breakpoint-content: 1400px'"
    >
        <AppNav v-if="!$ui.mobile" />
        <div v-else :ref="(el) => (appHeader = el)" />
        <div class="grow" />
        <ErrorLogs />
        <Account />
    </header>
</template>

<script setup lang="ts">
import { useOnboarded } from '@/utils/app';
import { appHeader } from '@/components';

const onboarded = useOnboarded();
</script>
