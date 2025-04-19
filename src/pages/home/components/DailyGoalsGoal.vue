<template>
    <div>
        <div class="flex justify-between text-sm font-medium">
            <span>{{ label }}</span>
            <span :class="{ 'text-red-700': current > goal }"> {{ current }} / {{ goal }} {{ units }} </span>
        </div>
        <div class="mt-1 h-2 rounded-full bg-gray-200">
            <ProgressBar :filled-class="`${barClass} duration-200`" :progress="current / goal" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineProps<{
    label: string;
    units: string;
    current: number;
    goal: number;
    barClass?: HTMLAttributes['class'];
}>();
</script>
