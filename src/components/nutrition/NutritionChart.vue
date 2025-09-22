<template>
    <div class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="flex items-center justify-center gap-8">
            <div class="relative">
                <div class="relative h-36 w-36">
                    <div class="absolute inset-0 rounded-full bg-gray-100" />
                    <div
                        class="absolute inset-2 rounded-full transition-[--protein-deg,--carbs-deg] duration-300 ease-in-out"
                        :style="{
                            background: `conic-gradient(
                                from 0deg,
                                var(--color-protein-500) 0deg var(--protein-deg),
                                var(--color-carbs-500) var(--protein-deg) calc(var(--protein-deg) + var(--carbs-deg)),
                                var(--color-fat-500) calc(var(--protein-deg) + var(--carbs-deg)) 360deg
                            )`,
                            '--carbs-deg': `${carbsPercentage * 360}deg`,
                            '--protein-deg': `${proteinPercentage * 360}deg`,
                        }"
                    />
                    <div class="absolute inset-6 flex items-center justify-center rounded-full bg-white">
                        <div class="flex flex-col items-center text-center">
                            <div class="text-lg font-bold text-gray-900">
                                {{ formatNumber(nutrition.calories, 'calories') }}
                            </div>
                            <span v-if="nutrition.servingInGrams" class="text-xs font-normal text-gray-500">
                                {{ formatNumber(nutrition.servingInGrams, 'grams') }}
                            </span>
                            <span v-else-if="nutrition.servingInMilliliters" class="text-xs font-normal text-gray-500">
                                {{ formatNumber(nutrition.servingInMilliliters, 'milliliters') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <div class="bg-protein-500 h-5 w-5 rounded-full" />
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold text-gray-900">
                            {{ $t('history.protein') }}
                        </span>
                        <span class="text-xs text-gray-600">
                            {{
                                formatPercentage(proteinPercentage, [carbsPercentage, proteinPercentage, fatPercentage])
                            }}
                            •
                            {{ formatNumber(nutrition.protein, 'grams') }}
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-carbs-500 h-5 w-5 rounded-full" />
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold text-gray-900">
                            {{ $t('history.carbs') }}
                        </span>
                        <span class="text-xs text-gray-600">
                            {{ formatPercentage(carbsPercentage, [carbsPercentage, proteinPercentage, fatPercentage]) }}
                            •
                            {{ formatNumber(nutrition.carbs, 'grams') }}
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-fat-500 h-5 w-5 rounded-full" />
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold text-gray-900">
                            {{ $t('history.fat') }}
                        </span>
                        <span class="text-xs text-gray-600">
                            {{ formatPercentage(fatPercentage, [carbsPercentage, proteinPercentage, fatPercentage]) }} •
                            {{ formatNumber(nutrition.fat, 'grams') }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber, formatPercentage } from '@/utils/formatting';
import type NutritionInformation from '@/models/NutritionInformation';

const { nutrition } = defineProps<{ nutrition: NutritionInformation }>();

// Calculate atwater macros percentages
// See https://en.wikipedia.org/wiki/Atwater_system#Modified_system
const atwaterProtein = computed(() => (nutrition.protein ?? 0) * 4);
const atwaterCarbs = computed(() => (nutrition.carbs ?? 0) * 4);
const atwaterFat = computed(() => (nutrition.fat ?? 0) * 9);
const atwaterTotal = computed(() => atwaterProtein.value + atwaterCarbs.value + atwaterFat.value);

const proteinPercentage = computed(() => atwaterProtein.value / atwaterTotal.value);
const carbsPercentage = computed(() => atwaterCarbs.value / atwaterTotal.value);
const fatPercentage = computed(() => atwaterFat.value / atwaterTotal.value);
</script>

<style>
@property --protein-deg {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
}

@property --carbs-deg {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
}
</style>
