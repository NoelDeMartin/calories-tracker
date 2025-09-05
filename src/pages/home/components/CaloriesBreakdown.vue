<template>
    <table class="w-full">
        <tr v-for="(ingredient, index) in breakdown" :key="index" class="border-b border-gray-200">
            <td class="flex items-center space-x-3 py-2">
                <div :class="ingredient.macroClass ?? 'bg-gray-400'" class="h-3 w-3 rounded-full" />
                <span class="text-sm font-medium">{{ ingredient.name }}</span>
            </td>
            <td class="text-right text-sm text-gray-600">
                <span class="font-medium">{{ formatNumber(ingredient.calories, 'calories') }}</span>
            </td>
        </tr>
        <tfoot v-if="showTotal">
            <tr>
                <td class="py-2 font-semibold text-gray-900">
                    {{ $t('logs.totalCalories') }}
                </td>
                <td class="text-right text-lg font-bold text-gray-900">
                    {{ formatNumber(totalCalories, 'calories') }}
                </td>
            </tr>
        </tfoot>
    </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber } from '@/utils/formatting';
import type { CaloriesBreakdown } from '@/models/Recipe';

const { breakdown } = defineProps<{ breakdown: CaloriesBreakdown; showTotal?: boolean }>();
const totalCalories = computed(() => breakdown.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0));
</script>
