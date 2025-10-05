<template>
    <Page>
        <Teleport v-if="$ui.mobile" :to="appHeader">
            <slot v-if="$slots.header" name="header" />
            <h1 v-else class="mb-4 text-2xl font-bold">
                {{ header }}
            </h1>
        </Teleport>

        <slot v-else-if="$slots.header" name="header" />
        <h1 v-else class="mb-4 text-2xl font-bold">
            {{ header }}
        </h1>

        <slot />
    </Page>
</template>

<script setup lang="ts">
import { appHeader } from '@/components';

const { header = undefined } = defineProps<{ header?: string }>();
</script>
