<template>
    <div class="w-full space-y-4">
        <DailyGoalsGoal
            label="Calories"
            units="kcal"
            :current="totalCalories"
            :goal="2000"
            bar-class="bg-blue-600"
        />
        <DailyGoalsGoal
            label="Protein"
            units="g"
            :current="totalProtein"
            :goal="150"
            bar-class="bg-red-500"
        />
        <DailyGoalsGoal
            label="Carbs"
            units="g"
            :current="totalCarbs"
            :goal="200"
            bar-class="bg-green-500"
        />
        <DailyGoalsGoal
            label="Fat"
            units="g"
            :current="totalFat"
            :goal="65"
            bar-class="bg-yellow-500"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type Meal from '@/models/Meal';

const { meals } = defineProps<{ meals: Meal[] }>();

const totalCalories = computed(() => meals.reduce((total, meal) => total + (meal.calories ?? 0), 0));
const totalProtein = computed(() => meals.reduce((total, meal) => total + (meal.protein ?? 0), 0));
const totalCarbs = computed(() => meals.reduce((total, meal) => total + (meal.carbs ?? 0), 0));
const totalFat = computed(() => meals.reduce((total, meal) => total + (meal.fat ?? 0), 0));
</script>
