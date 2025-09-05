<template>
    <div :key="meal.id" class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
            <h3 v-if="meal.recipe?.name" class="font-medium">
                {{ meal.recipe.name }}
                <span v-if="meal.recipe.servings" class="text-xs text-gray-500">({{ meal.recipe.servings }})</span>
            </h3>
            <p v-if="nutrition" class="text-sm text-gray-500">
                {{ formatNumber(nutrition.calories, 'calories') }} ·
                {{ $t('units.protein', { protein: formatNumber(nutrition.protein, 'grams') }) }} ·
                {{ $t('units.carbs', { carbs: formatNumber(nutrition.carbs, 'grams') }) }} ·
                {{ $t('units.fat', { fat: formatNumber(nutrition.fat, 'grams') }) }}
            </p>
            <p class="text-xs text-gray-400">
                {{ date }}
            </p>
        </div>
        <div class="flex space-x-1">
            <Button
                size="icon"
                variant="ghost"
                class="text-gray-400 transition-colors hover:text-green-500"
                :title="$t('logs.viewBreakdown')"
                :aria-label="$t('logs.viewBreakdown')"
                @click="$ui.modal(CaloriesBreakdownModal, { meal })"
            >
                <i-lucide-eye class="size-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                class="text-gray-400 transition-colors hover:text-red-500"
                :title="$t('logs.delete')"
                :aria-label="$t('logs.delete')"
                @click="deleteMeal()"
            >
                <i-lucide-trash2 class="size-5" />
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import CaloriesBreakdownModal from './CaloriesBreakdownModal.vue';
import { computed } from 'vue';
import { formatNumber } from '@/utils/formatting';
import { translate } from '@aerogel/core';
import type Meal from '@/models/Meal';

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

async function deleteMeal() {
    if (!confirm(translate('logs.deleteConfirm', { name: meal.recipe?.name }))) {
        return;
    }

    await meal.delete();
}
</script>
