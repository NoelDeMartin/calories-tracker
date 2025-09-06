<template>
    <Modal :title="meal.recipe?.name ?? $t('logs.meal')">
        <table class="w-full">
            <tr class="border-b border-gray-200">
                <td class="py-2 text-sm text-gray-600">
                    {{ $t('logs.mealServings') }}
                </td>
                <td class="py-2 text-right text-sm text-gray-900">
                    {{ meal.recipe?.servingsBreakdown?.quantity ?? 1 }}
                </td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="py-2 text-sm text-gray-600">
                    {{ $t('logs.mealCalories') }}
                </td>
                <td class="py-2 text-right text-sm text-gray-900">
                    {{ formatNumber(meal.recipe?.nutrition?.calories, 'calories') }}
                </td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="py-2 text-sm text-gray-600">
                    {{ $t('logs.mealProtein') }}
                </td>
                <td class="py-2 text-right text-sm text-gray-900">
                    {{ formatNumber(meal.recipe?.nutrition?.protein, 'grams') }}
                </td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="py-2 text-sm text-gray-600">
                    {{ $t('logs.mealCarbs') }}
                </td>
                <td class="py-2 text-right text-sm text-gray-900">
                    {{ formatNumber(meal.recipe?.nutrition?.carbs, 'grams') }}
                </td>
            </tr>
            <tr>
                <td class="py-2 text-sm text-gray-600">
                    {{ $t('logs.mealFat') }}
                </td>
                <td class="py-2 text-right text-sm text-gray-900">
                    {{ formatNumber(meal.recipe?.nutrition?.fat, 'grams') }}
                </td>
            </tr>
        </table>

        <template v-if="caloriesBreakdown?.length">
            <h2 class="mt-2 text-sm font-medium">
                {{ $t('logs.mealIngredients') }}
            </h2>
            <CaloriesBreakdown :breakdown="caloriesBreakdown" show-total />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { computed } from 'vue';
import { map, stringToSlug } from '@noeldemartin/utils';
import { formatNumber } from '@/utils/formatting';
import type Meal from '@/models/Meal';

const { meal } = defineProps<{ meal: Meal }>();
const recipes = useModelCollection(Recipe);
const ingredients = useModelCollection(Ingredient);
const recipesByUrl = computed(() => map(recipes.value, 'url'));
const ingredientsBySlug = computed(() => map(ingredients.value, ({ name }) => stringToSlug(name)));
const caloriesBreakdown = computed(() => {
    const _ingredientsBySlug = ingredientsBySlug.value;
    const recipeUrl = meal.recipe?.externalUrls.find((url) => recipesByUrl.value.get(url));
    const linkedRecipe = recipeUrl ? recipesByUrl.value.require(recipeUrl) : null;
    const recipe = linkedRecipe ?? meal.recipe;
    const recipeQuantity = recipe?.servingsBreakdown?.quantity ?? 1;
    const mealQuantity = meal.recipe?.servingsBreakdown?.quantity ?? 1;

    return recipe?.getCaloriesBreakdown(mealQuantity / recipeQuantity, _ingredientsBySlug);
});
</script>
