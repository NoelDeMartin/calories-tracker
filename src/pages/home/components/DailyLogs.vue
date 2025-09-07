<template>
    <Page>
        <DailyGoals :meals="todayMeals" />

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
</script>
