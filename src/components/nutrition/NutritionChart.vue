<template>
    <div class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="flex items-center justify-center gap-8">
            <div class="relative">
                <div class="relative h-36 w-36">
                    <div class="absolute inset-0 rounded-full bg-gray-100" />
                    <div
                        class="absolute inset-2 rounded-full"
                        :style="{
                            background: `conic-gradient(
                            from 0deg,
                            var(--color-protein-500) 0deg var(--protein-deg, 108deg),
                            var(--color-carbs-500)
                                var(--protein-deg, 108deg)
                                calc(var(--protein-deg, 108deg) + var(--carbs-deg, 126deg)),
                            var(--color-fat-500) calc(var(--carbs-deg, 126deg) + var(--protein-deg, 108deg)) 360deg
                        )`,
                            '--carbs-deg': `${carbsPercentage * 360}deg`,
                            '--protein-deg': `${proteinPercentage * 360}deg`,
                            '--fat-deg': `${fatPercentage * 360}deg`,
                        }"
                    />
                    <div class="absolute inset-6 flex items-center justify-center rounded-full bg-white">
                        <div class="text-center">
                            <div class="text-lg font-bold text-gray-900">
                                {{ formatNumber(macros.calories, 'calories') }}
                            </div>
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
                            {{ formatNumber(macros.protein, 'grams') }}
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
                            {{ formatNumber(macros.carbs, 'grams') }}
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
                            {{ formatNumber(macros.fat, 'grams') }}
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

const { macros } = defineProps<{ macros: { calories?: number; protein?: number; carbs?: number; fat?: number } }>();

// Calculate atwater macros percentages
// See https://en.wikipedia.org/wiki/Atwater_system#Modified_system
const atwaterProtein = computed(() => (macros.protein ?? 0) * 4);
const atwaterCarbs = computed(() => (macros.carbs ?? 0) * 4);
const atwaterFat = computed(() => (macros.fat ?? 0) * 9);
const atwaterTotal = computed(() => atwaterProtein.value + atwaterCarbs.value + atwaterFat.value);

const proteinPercentage = computed(() => atwaterProtein.value / atwaterTotal.value);
const carbsPercentage = computed(() => atwaterCarbs.value / atwaterTotal.value);
const fatPercentage = computed(() => atwaterFat.value / atwaterTotal.value);
</script>
