<template>
    <Page>
        <NutritionChart v-if="nutrition.calories" :nutrition />
        <Markdown v-else lang-key="logs.empty" class="mx-auto text-center" />

        <DailyGoals
            :total-calories
            :total-protein
            :total-carbs
            :total-fat
        />

        <div class="mt-6 w-full space-y-4">
            <MealLog v-for="meal of todayMeals" :key="meal.url" :meal />
        </div>

        <Button class="mt-4" @click="$ui.modal(CreateMealModal)">
            <i-zondicons-add-outline class="size-4" />
            <span>{{ $t('logs.add') }}</span>
        </Button>
    </Page>
</template>

<script setup lang="ts">
import Meal from '@/models/Meal';
import CreateMealModal from '@/components/meals/CreateMealModal.vue';
import { computedModels, useModelCollection } from '@aerogel/plugin-soukai';
import { sortedMeals } from '@/utils/meals';
import { computed } from 'vue';
import NutritionInformation from '@/models/NutritionInformation';

const meals = useModelCollection(Meal);
const today = new Date();
const todayMeals = computedModels(Meal, () =>
    sortedMeals(
        meals.value.filter((meal) => {
            const consumedAt = meal.consumedAt ?? meal.createdAt;

            return (
                consumedAt.getFullYear() === today.getFullYear() &&
                consumedAt.getMonth() === today.getMonth() &&
                consumedAt.getDate() === today.getDate()
            );
        }),
    ));
const totalCalories = computed(() =>
    Math.floor(todayMeals.value.reduce((total, meal) => total + (meal.recipe?.nutrition?.calories ?? 0), 0)));
const totalProtein = computed(() =>
    Math.floor(todayMeals.value.reduce((total, meal) => total + (meal.recipe?.nutrition?.protein ?? 0), 0)));
const totalCarbs = computed(() =>
    Math.floor(todayMeals.value.reduce((total, meal) => total + (meal.recipe?.nutrition?.carbs ?? 0), 0)));
const totalFat = computed(() =>
    Math.floor(todayMeals.value.reduce((total, meal) => total + (meal.recipe?.nutrition?.fat ?? 0), 0)));
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
