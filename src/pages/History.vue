<template>
    <AppPage>
        <template #header>
            <MonthPicker v-model="selectedMonth" />
        </template>

        <div v-if="!emptyMonth" class="relative [--bars-height:theme(spacing.44)]">
            <div
                class="pointer-events-none absolute inset-x-0 top-2 flex h-(--bars-height) flex-col justify-between select-none"
            >
                <span
                    v-if="$goals.calories"
                    class="absolute inset-x-0 border-b border-dashed border-red-500"
                    :style="{ top: `${(1 - $goals.calories / maxCalories) * 100}%` }"
                />
                <span
                    v-if="$goals.calories"
                    class="absolute right-0 -translate-y-full text-xs text-red-500"
                    :style="{ top: `${(1 - $goals.calories / maxCalories) * 100}%` }"
                >
                    {{ formatNumber($goals.calories, 'calories') }}
                </span>
                <span v-for="step of caloriesSteps" :key="step" class="w-full border-b border-dashed border-gray-300" />
            </div>
            <div
                class="absolute -top-2 right-0 flex h-[calc(var(--bars-height)+theme(spacing.4))] flex-col items-end justify-between"
            >
                <span v-for="step of caloriesSteps" :key="step" class="text-xs text-gray-500">
                    {{ formatNumber(step, 'calories') }}
                </span>
            </div>
            <div class="relative mr-20 flex overflow-x-auto overflow-y-hidden">
                <template v-for="day of days" :key="day">
                    <button
                        v-if="history[day]"
                        type="button"
                        class="flex flex-col items-center justify-end rounded px-1 py-2 transition-all duration-200 hover:scale-105"
                        :class="{ 'bg-blue-700/15': selectedDay === day }"
                        @click="selectedDay = day"
                    >
                        <div class="flex h-(--bars-height) items-end">
                            <div class="relative w-5" :style="`height: ${history[day].scalePercentage * 100}%`">
                                <div class="bg-protein-500 absolute inset-x-0 bottom-0 h-full rounded" />
                                <div
                                    class="bg-carbs-500 absolute inset-x-0 bottom-0"
                                    :style="{
                                        height: `${(history[day].carbsPercentage + history[day].fatPercentage) * 100}%`,
                                    }"
                                />
                                <div
                                    class="bg-fat-500 absolute inset-x-0 bottom-0"
                                    :style="{ height: `${history[day].fatPercentage * 100}%` }"
                                />
                            </div>
                        </div>
                        <div class="mt-1 flex h-8 flex-col" :class="{ 'font-semibold': day === selectedDay }">
                            <span class="text-sm">
                                {{ day }}
                            </span>
                            <span class="text-xs">
                                {{ history[day].weekday }}
                            </span>
                        </div>
                    </button>
                    <div v-else class="w-7 shrink-0" />
                </template>
            </div>
        </div>

        <div v-else class="mt-4">
            <p class="text-center text-gray-500">
                {{ $t('history.emptyMonth') }}
            </p>
        </div>

        <div v-if="selectedDayData" class="mt-4">
            <h3 class="text-center text-2xl font-medium">
                {{
                    $t('history.meals', {
                        n: selectedDayData.meals.length,
                        day: selectedDayDisplay,
                    })
                }}
            </h3>

            <NutritionChart class="mt-4" :nutrition="selectedDayData.nutrition" />

            <div class="mt-6 w-full space-y-4">
                <MealLog v-for="meal of selectedDayData.meals" :key="meal.url" :meal />
            </div>
        </div>
    </AppPage>
</template>

<script setup lang="ts">
import Meal from '@/models/Meal';
import NutritionInformation from '@/models/NutritionInformation';
import Goals from '@/services/Goals';
import { range } from '@noeldemartin/utils';
import { computed, ref, watch } from 'vue';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { formatNumber } from '@/utils/formatting';
import { sortedMeals } from '@/utils/meals';
import { getMacrosCalories } from '@/utils/nutrition';

interface Macros {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
}

const meals = useModelCollection(Meal);
const selectedMonth = ref({ month: new Date().getMonth(), year: new Date().getFullYear() });
const daysInMonth = computed(() => new Date(selectedMonth.value.year, selectedMonth.value.month + 1, 0).getDate());
const days = computed(() => range(daysInMonth.value).map((day) => day + 1));
const mealsByDay = computed(() => {
    const values = Object.fromEntries(days.value.map((day) => [day, [] as Meal[]]));

    for (const meal of meals.value) {
        const consumedAt = meal.consumedAt ?? meal.createdAt;

        if (
            consumedAt.getFullYear() !== selectedMonth.value.year ||
            consumedAt.getMonth() !== selectedMonth.value.month
        ) {
            continue;
        }

        values[consumedAt.getDate()]?.push(meal);
    }

    return values;
});
const macrosByDay = computed(() =>
    Object.fromEntries(
        days.value.map((day) => {
            const dayMeals = mealsByDay.value[day];
            const calories = dayMeals.reduce((acc, meal) => acc + (meal.recipe?.nutrition?.calories ?? 0), 0);
            const carbs = dayMeals.reduce((acc, meal) => acc + (meal.recipe?.nutrition?.carbs ?? 0), 0);
            const protein = dayMeals.reduce((acc, meal) => acc + (meal.recipe?.nutrition?.protein ?? 0), 0);
            const fat = dayMeals.reduce((acc, meal) => acc + (meal.recipe?.nutrition?.fat ?? 0), 0);

            return [day, { calories, carbs, protein, fat } as Macros];
        }),
    ));
const maxCalories = computed(
    () =>
        Math.ceil(
            Math.max(Goals.calories ?? 0, ...Object.values(macrosByDay.value).map((macros) => macros.calories)) / 1000,
        ) * 1000,
);

const caloriesSteps = computed(() =>
    range((maxCalories.value + 1000) / 1000)
        .map((i) => 1000 * i)
        .reverse());

const history = computed(() =>
    Object.fromEntries(
        days.value.map((day) => {
            const dayMeals = sortedMeals(mealsByDay.value[day]);
            const macros = macrosByDay.value[day];
            const weekday = new Date(selectedMonth.value.year, selectedMonth.value.month, day).toLocaleDateString(
                undefined,
                { weekday: 'short' },
            );
            const macrosCalories = getMacrosCalories(macros);

            return [
                day,
                dayMeals.length === 0
                    ? null
                    : {
                        meals: dayMeals,
                        weekday,
                        nutrition: new NutritionInformation({
                            rawCalories: `${macros.calories} calories`,
                            rawCarbs: `${macros.carbs} grams`,
                            rawProtein: `${macros.protein} grams`,
                            rawFat: `${macros.fat} grams`,
                        }),
                        scalePercentage: macros.calories / maxCalories.value,
                        proteinPercentage: macrosCalories.proteinPercentage,
                        carbsPercentage: macrosCalories.carbsPercentage,
                        fatPercentage: macrosCalories.fatPercentage,
                    },
            ];
        }),
    ));

const emptyMonth = computed(() => Object.values(history.value).every((day) => !day));

const selectedDay = ref(
    Number(
        Object.entries(history.value)
            .reverse()
            .find(([, value]) => !!value)?.[0],
    ),
);
const selectedDayDisplay = computed(() =>
    new Date(selectedMonth.value.year, selectedMonth.value.month, selectedDay.value).toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }));
const selectedDayData = computed(() => selectedDay.value && history.value[selectedDay.value]);

watch(history, () => {
    if (selectedDay.value && history.value[selectedDay.value]) {
        return;
    }

    selectedDay.value = Number(
        Object.entries(history.value)
            .reverse()
            .find(([, value]) => !!value)?.[0],
    );
});
</script>
