<template>
    <div :key="meal.id" class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
            <h3 v-if="meal.recipe?.name" class="font-medium">
                {{ meal.recipe.name }}
            </h3>
            <p v-if="nutrition" class="text-sm text-gray-500">
                {{ $t('units.calories', nutrition.calories ?? 0) }} ·
                {{ $t('units.protein', { protein: $t('units.grams', nutrition.protein ?? 0) }) }} ·
                {{ $t('units.carbs', { carbs: $t('units.grams', nutrition.carbs ?? 0) }) }} ·
                {{ $t('units.fat', { fat: $t('units.grams', nutrition.fat ?? 0) }) }}
            </p>
            <p class="text-xs text-gray-400">
                {{ date }}
            </p>
        </div>
        <Button
            size="icon"
            variant="ghost"
            class="text-gray-400 transition-colors hover:text-red-500"
            :title="$t('logs.delete')"
            :aria-label="$t('logs.delete')"
            @click="$ui.alert('Not implemented!')"
        >
            <i-lucide-trash2 class="size-5" />
        </Button>
    </div>
</template>

<script setup lang="ts">
import type Meal from '@/models/Meal';
import { computed } from 'vue';

const { meal } = defineProps<{ meal: Meal }>();
const date = computed(() => meal.createdAt.toLocaleString());
const nutrition = computed(() => {
    const mealNutrition = meal.recipe?.nutrition;

    if (!mealNutrition) {
        return null;
    }

    return {
        calories: mealNutrition.calories,
        protein: mealNutrition.protein,
        carbs: mealNutrition.carbs,
        fat: mealNutrition.fat,
    };
});
</script>
