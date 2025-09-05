<template>
    <Modal :title="$t('logs.caloriesBreakdown', { name: meal.recipe?.name ?? $t('logs.meal') })">
        <CaloriesBreakdown v-if="caloriesBreakdown?.length" :breakdown="caloriesBreakdown" show-total />
        <p v-else class="text-sm text-gray-600">
            {{ $t('logs.noIngredients') }}
        </p>
    </Modal>
</template>

<script setup lang="ts">
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { computed } from 'vue';
import { map } from '@noeldemartin/utils';
import type Meal from '@/models/Meal';

const { meal } = defineProps<{ meal: Meal }>();
const recipes = useModelCollection(Recipe);
const ingredients = useModelCollection(Ingredient);
const recipesByUrl = computed(() => map(recipes.value, 'url'));
const ingredientsByName = computed(() => map(ingredients.value, 'name'));
const caloriesBreakdown = computed(() => {
    const ingredientsMap = ingredientsByName.value;
    const recipeUrl = meal.recipe?.externalUrls.find((url) => recipesByUrl.value.get(url));
    const recipe = recipeUrl ? recipesByUrl.value.require(recipeUrl) : null;

    if (!recipe?.servingsBreakdown?.quantity || !meal.recipe?.servingsBreakdown?.quantity) {
        return;
    }

    return recipe.getCaloriesBreakdown(
        meal.recipe.servingsBreakdown.quantity / recipe.servingsBreakdown.quantity,
        ingredientsMap,
    );
});
</script>
