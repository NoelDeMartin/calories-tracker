<template>
    <div class="rounded-lg border bg-white shadow-sm">
        <div ref="$container" class="overflow-x-auto overflow-y-hidden">
            <div class="flex items-end p-6">
                <button
                    v-for="(week, index) in weeks"
                    :key="index"
                    type="button"
                    class="flex w-20 shrink-0 cursor-pointer flex-col items-center p-2 transition-all duration-200 hover:scale-105"
                    :class="selectedWeek === week ? 'bg-blue-100' : ''"
                    @click="$emit('selectWeek', week)"
                >
                    <div class="relative flex h-64 w-full items-end">
                        <div
                            class="flex w-full flex-col transition-all duration-200"
                            :style="{ height: `${(week.totalCalories * 100) / maxCalories}%` }"
                        >
                            <div
                                class="bg-protein-500 w-full rounded-t transition-all duration-200"
                                :style="{ flex: `${week.proteinPercentage}` }"
                            />
                            <div
                                class="bg-carbs-500 w-full transition-all duration-200"
                                :style="{ flex: `${week.carbsPercentage}` }"
                            />
                            <div
                                class="bg-fat-500 w-full rounded-b transition-all duration-200"
                                :style="{ flex: `${week.fatPercentage}` }"
                            />
                        </div>
                        <i-lucide-alert-triangle
                            v-if="week.hasIncompleteMeals"
                            class="absolute inset-x-0 bottom-2 m-auto size-5 text-red-400"
                        />
                    </div>
                    <div class="mt-2 text-xs text-gray-600">
                        {{ week.name }}
                    </div>
                    <div class="text-xs font-medium text-gray-900">
                        {{ formatNumber(week.totalCalories, 'calories') }}
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatNumber } from '@/utils/formatting';
import { computed, useTemplateRef, watch } from 'vue';
import { max } from '@/utils/math';
import type { Week } from '@/pages/insights';

defineEmits<{ selectWeek: [Week] }>();

const { weeks } = defineProps<{ weeks: Week[]; selectedWeek: Week | null }>();
const $container = useTemplateRef('$container');
const maxCalories = computed(() => max(weeks.map((week) => week.totalCalories)));

watch($container, () => $container.value && ($container.value.scrollLeft = $container.value.scrollWidth));
</script>
