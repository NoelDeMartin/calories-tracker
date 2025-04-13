<template>
    <DailyGoals :meals />

    <div class="mt-6 w-full space-y-4">
        <MealLog v-for="meal of meals" :key="meal.url" :meal />
    </div>

    <Button class="mt-4" @click="logMeal()">
        <i-zondicons-add-outline class="size-4" />
        <span>{{ $t('logs.add') }}</span>
    </Button>
</template>

<script setup lang="ts">
import { shallowReactive } from 'vue';
import { UI } from '@aerogel/core';

import LogMealModal from '@/components/LogMealModal.vue';
import Meal from '@/models/Meal';

const meals = shallowReactive<Meal[]>([]);

async function logMeal() {
    const recipe = await UI.modalForm(LogMealModal);

    if (!recipe) {
        return;
    }

    const meal = new Meal({
        calories: 350,
        protein: 12,
        carbs: 65,
        fat: 6,
    });

    meal.recipe = recipe;

    meals.push(meal);
}
</script>
