<template>
    <AppPage :header="$t('insights.title')" class="space-y-6">
        <InsightsWeeks
            v-if="weeks.length"
            :weeks
            :selected-week
            @select-week="selectedWeek = $event"
        />

        <div v-else class="text-center text-gray-500">
            {{ $t('insights.empty') }}
        </div>

        <template v-if="selectedWeek">
            <InsightsIncompleteMeals :week="selectedWeek" />

            <h2 class="text-2xl font-semibold text-gray-900">
                {{ $t('insights.weekFeeding') }}
            </h2>
            <InsightsFeeding :week="selectedWeek" />

            <h2 class="text-2xl font-semibold text-gray-900">
                {{ $t('insights.weekMacros') }}
            </h2>
            <InsightsMacros :week="selectedWeek" />
        </template>
    </AppPage>
</template>

<script setup lang="ts">
import Meal from '@/models/Meal';
import { getWeekNumber } from '@/utils/time';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { computed, shallowRef, watch } from 'vue';
import { getMacrosCalories } from '@/utils/nutrition';
import { arraySorted } from '@noeldemartin/utils';
import { translate } from '@aerogel/core';
import type { Week } from '@/pages/insights';

const meals = useModelCollection(Meal);
const weeks = computed(() => {
    const mealsByWeek = meals.value.reduce(
        (acc, meal) => {
            const date = meal.consumedAt ?? meal.createdAt;

            if (date) {
                const week = translate('insights.week', { year: date.getFullYear(), number: getWeekNumber(date) });

                acc[week] ??= [];
                acc[week].push(meal);
            }

            return acc;
        },
        {} as Record<string, Meal[]>,
    );

    return arraySorted(
        Object.entries(mealsByWeek).map(([week, weekMeals]) => {
            const caloriesBreakdown = weekMeals.flatMap((meal) => meal.getCaloriesBreakdown() ?? []);
            const protein = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.protein ?? 0), 0);
            const carbs = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.carbs ?? 0), 0);
            const fat = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.fat ?? 0), 0);
            const calories = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0);
            const macrosCalories = getMacrosCalories({ protein, carbs, fat });
            const days = new Set(weekMeals.map((meal) => (meal.consumedAt ?? meal.createdAt).getDay())).size;

            return {
                name: week,
                meals: weekMeals,
                hasIncompleteMeals: weekMeals.some((meal) => meal.incomplete),
                totalCalories: Math.round(calories),
                caloriesAverage: Math.round(calories / days),
                proteinAverage: Math.round(protein / days),
                carbsAverage: Math.round(carbs / days),
                fatAverage: Math.round(fat / days),
                proteinPercentage: macrosCalories.proteinPercentage,
                carbsPercentage: macrosCalories.carbsPercentage,
                fatPercentage: macrosCalories.fatPercentage,
            } satisfies Week;
        }),
        'name',
    );
});
const selectedWeek = shallowRef<Week | null>(null);

watch(
    weeks,
    () => {
        if (selectedWeek.value && weeks.value.some((week) => week === selectedWeek.value)) {
            return;
        }

        selectedWeek.value = weeks.value[weeks.value.length - 1] ?? null;
    },
    { immediate: true },
);
</script>
