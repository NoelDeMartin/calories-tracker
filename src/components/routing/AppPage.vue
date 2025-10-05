<template>
    <Page>
        <Teleport v-if="$ui.mobile" :to="appHeader">
            <slot v-if="$slots.header" name="header" />
            <h1 v-else-if="header" class="text-2xl font-bold">
                {{ header }}
            </h1>
        </Teleport>

        <div v-else class="mb-4">
            <slot v-if="$slots.header" name="header" />
            <h1 v-else-if="header" class="text-2xl font-bold">
                {{ header }}
            </h1>
        </div>

        <slot />
    </Page>
</template>

<script setup lang="ts">
import { appHeader } from '@/components';

const { header = undefined } = defineProps<{ header?: string }>();
</script>
