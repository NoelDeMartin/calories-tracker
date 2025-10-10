<template>
    <AppPage :header="$t('insights.title')" class="space-y-6">
        <InsightsIncompleteMeals />

        <InsightsWeeks :weeks :selected-week @select-week="selectedWeek = $event" />

        <h2 class="text-2xl font-semibold text-gray-900">
            {{ $t('insights.week') }}
        </h2>

        <div v-if="selectedWeek" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="grid grid-cols-2 gap-4 lg:col-span-2">
                <InsightsMacro
                    :name="$t('insights.calories')"
                    :value="selectedWeek.caloriesAverage"
                    :goal="$goals.calories"
                    :icon="IlucideFlame"
                    unit="calories"
                    icon-class="text-[color-mix(in_srgb,var(--color-calories-500),black_40%)]"
                    icon-background-class="bg-calories-500/30"
                    bar-filled-class="bg-calories-500"
                    bar-overflow-class="bg-[color-mix(in_srgb,var(--color-calories-500),black_40%)]"
                />

                <InsightsMacro
                    min
                    :name="$t('insights.protein')"
                    :value="selectedWeek.proteinAverage"
                    :goal="$goals.protein"
                    :icon="IlucideDumbbell"
                    unit="grams"
                    icon-class="text-[color-mix(in_srgb,var(--color-protein-500),black_40%)]"
                    icon-background-class="bg-protein-500/30"
                    bar-filled-class="bg-protein-500"
                    bar-overflow-class="bg-[color-mix(in_srgb,var(--color-protein-500),black_40%)]"
                />

                <InsightsMacro
                    min
                    :name="$t('insights.carbs')"
                    :value="selectedWeek.carbsAverage"
                    :goal="$goals.carbs"
                    :icon="IlucideWheat"
                    unit="grams"
                    icon-class="text-[color-mix(in_srgb,var(--color-carbs-500),black_40%)]"
                    icon-background-class="bg-carbs-500/30"
                    bar-filled-class="bg-carbs-500"
                    bar-overflow-class="bg-[color-mix(in_srgb,var(--color-carbs-500),black_40%)]"
                />

                <InsightsMacro
                    min
                    :name="$t('insights.fat')"
                    :value="selectedWeek.fatAverage"
                    :goal="$goals.fat"
                    :icon="IlucideDroplet"
                    unit="grams"
                    icon-class="text-[color-mix(in_srgb,var(--color-fat-500),black_40%)]"
                    icon-background-class="bg-fat-500/30"
                    bar-filled-class="bg-fat-500"
                    bar-overflow-class="bg-[color-mix(in_srgb,var(--color-fat-500),black_40%)]"
                />
            </div>

            <InsightsMacros :week="selectedWeek" />
        </div>
    </AppPage>
</template>

<script setup lang="ts">
import IlucideFlame from '~icons/lucide/flame';
import IlucideDumbbell from '~icons/lucide/dumbbell';
import IlucideWheat from '~icons/lucide/wheat';
import IlucideDroplet from '~icons/lucide/droplet';
import Meal from '@/models/Meal';
import { getWeekNumber } from '@/utils/time';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { computed, shallowRef, watch } from 'vue';
import { getMacrosCalories } from '@/utils/nutrition';
import type { Week } from '@/pages/insights';

const meals = useModelCollection(Meal);
const weeks = computed(() => {
    const mealsByWeek = meals.value.reduce(
        (acc, meal) => {
            const date = meal.consumedAt ?? meal.createdAt;

            if (date) {
                const week = `${date.getFullYear()}-w${getWeekNumber(date)}`;

                acc[week] ??= [];
                acc[week].push(meal);
            }

            return acc;
        },
        {} as Record<string, Meal[]>,
    );

    return Object.entries(mealsByWeek).map(([week, weekMeals]) => {
        const caloriesBreakdown = weekMeals.flatMap((meal) => meal.getCaloriesBreakdown() ?? []);
        const protein = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.protein ?? 0), 0);
        const carbs = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.carbs ?? 0), 0);
        const fat = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.fat ?? 0), 0);
        const calories = caloriesBreakdown.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0);
        const macrosCalories = getMacrosCalories({ protein, carbs, fat });
        const days = new Set(weekMeals.map((meal) => (meal.consumedAt ?? meal.createdAt).getDay())).size;

        return {
            name: week,
            totalCalories: Math.round(calories),
            caloriesAverage: Math.round(calories / days),
            proteinAverage: Math.round(protein / days),
            carbsAverage: Math.round(carbs / days),
            fatAverage: Math.round(fat / days),
            proteinPercentage: macrosCalories.proteinPercentage,
            carbsPercentage: macrosCalories.carbsPercentage,
            fatPercentage: macrosCalories.fatPercentage,
        } satisfies Week;
    });
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
