<template>
    <NutritionChart :nutrition />
    <div v-if="$goals.calories || $goals.protein || $goals.carbs || $goals.fat" class="mt-4 w-full space-y-4">
        <DailyGoalsGoal
            v-if="$goals.calories"
            label="Calories"
            units="kcal"
            :current="totalCalories"
            :goal="$goals.calories"
            bar-filled-class="bg-calories-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-calories-500),black_40%)]"
        />
        <DailyGoalsGoal
            v-if="$goals.protein"
            label="Protein"
            units="g"
            :current="totalProtein"
            :goal="$goals.protein"
            bar-filled-class="bg-protein-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-protein-500),black_40%)]"
        />
        <DailyGoalsGoal
            v-if="$goals.carbs"
            label="Carbs"
            units="g"
            :current="totalCarbs"
            :goal="$goals.carbs"
            bar-filled-class="bg-carbs-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-carbs-500),black_40%)]"
        />
        <DailyGoalsGoal
            v-if="$goals.fat"
            label="Fat"
            units="g"
            :current="totalFat"
            :goal="$goals.fat"
            bar-filled-class="bg-fat-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-fat-500),black_40%)]"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import NutritionInformation from '@/models/NutritionInformation';
import type Meal from '@/models/Meal';

const { meals } = defineProps<{ meals: Meal[] }>();

const totalCalories = computed(() =>
    Math.floor(meals.reduce((total, meal) => total + (meal.recipe?.nutrition?.calories ?? 0), 0)));
const totalProtein = computed(() =>
    Math.floor(meals.reduce((total, meal) => total + (meal.recipe?.nutrition?.protein ?? 0), 0)));
const totalCarbs = computed(() =>
    Math.floor(meals.reduce((total, meal) => total + (meal.recipe?.nutrition?.carbs ?? 0), 0)));
const totalFat = computed(() =>
    Math.floor(meals.reduce((total, meal) => total + (meal.recipe?.nutrition?.fat ?? 0), 0)));
const nutrition = computed(
    () =>
        new NutritionInformation({
            rawCalories: `${totalCalories.value} calories`,
            rawProtein: `${totalProtein.value} grams`,
            rawCarbs: `${totalCarbs.value} grams`,
            rawFat: `${totalFat.value} grams`,
        }),
);
</script>
