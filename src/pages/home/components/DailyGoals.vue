<template>
    <div class="w-full space-y-4">
        <DailyGoalsGoal
            label="Calories"
            units="kcal"
            :current="totalCalories"
            :goal="2000"
            bar-class="bg-calories-500"
        />
        <DailyGoalsGoal
            label="Protein"
            units="g"
            :current="totalProtein"
            :goal="150"
            bar-class="bg-protein-500"
        />
        <DailyGoalsGoal
            label="Carbs"
            units="g"
            :current="totalCarbs"
            :goal="200"
            bar-class="bg-carbs-500"
        />
        <DailyGoalsGoal
            label="Fat"
            units="g"
            :current="totalFat"
            :goal="65"
            bar-class="bg-fat-500"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
</script>
