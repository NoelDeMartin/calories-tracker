<template>
    <Page>
        <MonthPicker v-model="selectedMonth" />

        <div v-if="!emptyMonth" class="relative mt-11 flex h-44 w-full items-end justify-between">
            <div
                class="pointer-events-none absolute inset-x-0 -top-10 bottom-10 flex flex-col justify-between select-none"
            >
                <div v-for="step of caloriesSteps" :key="step" class="w-full border-b border-dashed border-gray-300" />
            </div>
            <template v-for="day of days" :key="day">
                <button
                    v-if="history[day]"
                    type="button"
                    class="flex flex-1 flex-col items-center justify-end rounded-full pt-2 pb-1 hover:bg-gray-100"
                    :class="{ 'opacity-75': selectedDay !== day }"
                    :style="`height: calc(var(--spacing) * 13 + ${history[day].scalePercentage * 100}%)`"
                    @click="selectedDay = day"
                >
                    <div class="relative h-full w-2.5">
                        <div class="bg-protein-500 absolute inset-x-0 bottom-0 h-full rounded-full" />
                        <div
                            class="bg-carbs-500 absolute inset-x-0 bottom-0"
                            :style="{ height: `${(history[day].carbsPercentage + history[day].fatPercentage) * 100}%` }"
                        />
                        <div
                            class="bg-fat-500 absolute inset-x-0 bottom-0"
                            :style="{ height: `${history[day].fatPercentage * 100}%` }"
                        />
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
                <span v-else class="flex-1" />
            </template>
            <div
                class="mb-10 ml-2 flex flex-col items-end justify-between"
                :style="`height: calc(var(--spacing) * 4 + 100%)`"
            >
                <span v-for="step of caloriesSteps" :key="step" class="text-xs text-gray-500">
                    {{ formatNumber(step, 'calories') }}
                </span>
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
    </Page>
</template>

<script setup lang="ts">
import Meal from '@/models/Meal';
import NutritionInformation from '@/models/NutritionInformation';
import { range } from '@noeldemartin/utils';
import { computed, ref, watch } from 'vue';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { formatNumber } from '@/utils/formatting';
import { sortedMeals } from '@/utils/meals';

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
    () => Math.ceil(Math.max(...Object.values(macrosByDay.value).map((macros) => macros.calories)) / 1000) * 1000,
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
                {
                    weekday: 'short',
                },
            );

            // Calculate atwater macros
            // See https://en.wikipedia.org/wiki/Atwater_system#Modified_system
            const atwaterProtein = macros.protein * 4;
            const atwaterCarbs = macros.carbs * 4;
            const atwaterFat = macros.fat * 9;
            const atwaterTotal = atwaterProtein + atwaterCarbs + atwaterFat;

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
                        proteinPercentage: atwaterProtein / atwaterTotal,
                        carbsPercentage: atwaterCarbs / atwaterTotal,
                        fatPercentage: atwaterFat / atwaterTotal,
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
