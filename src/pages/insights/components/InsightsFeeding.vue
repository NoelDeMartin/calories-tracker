<template>
    <div class="overflow-x-auto overflow-y-hidden rounded-lg border bg-white p-2 shadow-sm md:p-6">
        <div class="grid min-w-[400px] grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-0.5 md:gap-1">
            <div />

            <span v-for="hour in range(24)" :key="hour" class="text-center text-xs md:text-sm">
                {{ hour }}
            </span>

            <template v-for="day of days" :key="day.shortName">
                <div class="mr-1 text-xs font-medium text-gray-700 md:text-sm">
                    <span class="hidden sm:inline">{{ day.shortName }}</span>
                    <span class="inline sm:hidden">{{ day.narrowName }}</span>
                </div>

                <div
                    v-for="hour in 24"
                    :key="hour"
                    class="h-4 rounded-sm border border-gray-200 transition-all duration-200 md:h-6"
                    :class="
                        hour < day.fastingEnd || hour > day.fastingStart
                            ? 'bg-gray-100'
                            : getHeatClass(day.hours[hour] ?? 0)
                    "
                    :title="
                        hour < day.fastingEnd || hour > day.fastingStart
                            ? 'Fasting'
                            : formatNumber(day.hours[hour] ?? 0, 'calories')
                    "
                />
            </template>
        </div>

        <div class="mt-6 flex justify-between sm:items-center">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div class="text-sm text-gray-500">
                    {{ $t('insights.feedingCalories') }}
                </div>
                <div class="flex items-center space-x-2">
                    <div class="h-4 w-4 rounded-sm border border-gray-200 bg-gray-100" />
                    <span class="text-xs text-gray-500">{{ $t('insights.feedingFasting') }}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="h-4 w-4 rounded-sm border border-gray-200 bg-blue-300" />
                    <span class="text-xs text-gray-500">0-250</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="h-4 w-4 rounded-sm border border-gray-200 bg-blue-500" />
                    <span class="text-xs text-gray-500">250-500</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="h-4 w-4 rounded-sm border border-gray-200 bg-blue-700" />
                    <span class="text-xs text-gray-500">500+</span>
                </div>
            </div>
            <div class="flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center">
                <span>{{ $t('insights.feedingFastingAverage') }}</span>
                <span>
                    {{ formatNumber(average(days.map((day) => 23 - day.fastingStart + day.fastingEnd)), 'hours') }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { range } from '@noeldemartin/utils';
import { average, sum } from '@/utils/math';
import { formatNumber } from '@/utils/formatting';
import type { Week } from '@/pages/insights';

const { week } = defineProps<{ week: Week }>();
const days = computed(() => {
    const rows: Partial<Record<number, Partial<Record<number, number>>>> = {};

    for (const meal of week.meals) {
        const date = meal.consumedAt ?? meal.createdAt;

        if (!date) {
            continue;
        }

        const breakdown = meal.getCaloriesBreakdown() ?? [];
        const day = date.getDay();
        const hour = date.getHours();
        const row = (rows[day] ??= {});

        row[hour] ??= 0;
        row[hour] += sum(breakdown.map((ingredient) => ingredient.calories ?? 0));
    }

    const { format: shortFormat } = Intl.DateTimeFormat(undefined, { weekday: 'short' });
    const { format: narrowFormat } = Intl.DateTimeFormat(undefined, { weekday: 'narrow' });

    return Object.entries(rows).map(([day, hours]) => ({
        shortName: shortFormat(new Date(2021, 5, Number(day) - 1)),
        narrowName: narrowFormat(new Date(2021, 5, Number(day) - 1)),
        fastingEnd: range(24).find((hour) => hours && hour in hours) ?? 24,
        fastingStart:
            range(24)
                .reverse()
                .find((hour) => hours && hour in hours) ?? 0,
        hours: hours ?? {},
    }));
});

function getHeatClass(calories: number): string {
    if (calories === 0) {
        return 'bg-blue-100';
    }

    if (calories < 250) {
        return 'bg-blue-300';
    }

    if (calories < 500) {
        return 'bg-blue-500';
    }

    return 'bg-blue-700';
}
</script>
