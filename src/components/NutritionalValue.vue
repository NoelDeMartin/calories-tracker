<template>
    <span v-if="typeof value !== 'number'">
        {{ fallback ?? $t(`units.${unit}`, { n: '?' }) }}
    </span>
    <span v-else>
        {{ $t(`units.${unit}`, value) }}
    </span>
</template>

<script setup lang="ts">
import type { Nullable } from '@noeldemartin/utils';

defineProps<{
    value: Nullable<number>;
    unit: 'grams' | 'calories';
    fallback?: string;
}>();
</script>
