<template>
    <div>
        <div class="flex justify-between text-sm font-medium">
            <span>{{ label }}</span>
            <span :class="{ 'text-red-700': min ? current < goal : current > goal }">
                {{ current }} / {{ formatNumber(goal, unit) }}
            </span>
        </div>
        <div class="mt-1 h-2 rounded-full bg-gray-200">
            <ProgressBar
                :filled-class="`${barFilledClass} duration-200`"
                :overflow-class="`${barOverflowClass} duration-200`"
                :progress="current / goal"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { type FormatUnit, formatNumber } from '@/utils/formatting';
import type { HTMLAttributes } from 'vue';

defineProps<{
    goal: number;
    current: number;
    unit: FormatUnit;
    label?: string;
    min?: boolean;
    barFilledClass?: HTMLAttributes['class'];
    barOverflowClass?: HTMLAttributes['class'];
}>();
</script>
