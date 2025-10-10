<template>
    <div class="flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
            <div :class="iconBackgroundClass" class="rounded-full p-3">
                <component :is="icon" :class="iconClass" class="size-6" />
            </div>
            <div>
                <p class="text-end text-sm font-medium text-gray-600">
                    {{ name }}
                </p>
                <p class="text-end text-2xl font-bold text-gray-900">
                    {{ formatNumber(value, unit) }}
                </p>
            </div>
        </div>

        <GoalProgress
            v-if="goal"
            class="mt-2"
            :goal
            :unit
            :min
            :current="value"
            :bar-filled-class
            :bar-overflow-class
        />
    </div>
</template>

<script setup lang="ts">
import { type FormatUnit, formatNumber } from '@/utils/formatting';
import type { Nullable } from '@noeldemartin/utils';
import type { Component } from 'vue';

defineProps<{
    name: string;
    value: number;
    unit: FormatUnit;
    icon: Component;
    min?: boolean;
    iconClass?: string;
    iconBackgroundClass?: string;
    goal?: Nullable<number>;
    barFilledClass?: string;
    barOverflowClass?: string;
}>();
</script>
