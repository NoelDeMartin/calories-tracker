<template>
    <Details
        v-if="sortedIncompleteMeals.length"
        :label="$t('insights.incompleteMeals', { n: sortedIncompleteMeals.length })"
        content-class="pl-0 w-full space-y-4"
        summary-class="text-red-500"
    >
        <template #label>
            <div class="flex items-center space-x-2">
                <i-lucide-alert-triangle class="size-4" />
                <span>{{ $t('insights.incompleteMeals', { n: sortedIncompleteMeals.length }) }}</span>
            </div>
        </template>
        <MealLog v-for="meal of sortedIncompleteMeals" :key="meal.url" :meal />
    </Details>
</template>

<script setup lang="ts">
import Meal from '@/models/Meal';
import { computed } from 'vue';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { sortedMeals } from '@/utils/meals';

const meals = useModelCollection(Meal);
const sortedIncompleteMeals = computed(() => sortedMeals(meals.value.filter((meal) => meal.incomplete)));
</script>
