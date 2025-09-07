<template>
    <Modal :title="$t('logs.editTitle', { name: meal.recipe?.name || $t('logs.meal') })">
        <Form :form class="space-y-2" @submit="submit()">
            <Input name="name" :label="$t('logs.mealName')" />
            <Select
                name="recipe"
                :label="$t('logs.mealRecipe')"
                :options="recipesOptions"
                :render-option="renderRecipe"
                :compare-options="(a, b) => a.id === b.id"
            />
            <Input name="calories" :label="$t('logs.mealCalories')" step="0.01" />
            <Input name="protein" :label="$t('logs.mealProtein')" step="0.01" />
            <Input name="carbs" :label="$t('logs.mealCarbs')" step="0.01" />
            <Input name="fat" :label="$t('logs.mealFat')" step="0.01" />
            <Input name="consumedAt" :label="$t('logs.mealConsumedAt')" type="datetime-local" />

            <div class="mt-4 flex justify-end space-x-2">
                <Button variant="secondary" @click="close">
                    {{ $t('ui.cancel') }}
                </Button>
                <Button submit>
                    {{ $t('ui.save') }}
                </Button>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { arrayRemove, round } from '@noeldemartin/utils';
import {
    numberInput,
    requiredDateInput,
    requiredNumberInput,
    requiredObjectInput,
    requiredStringInput,
    translate,
    useForm,
    useModal,
} from '@aerogel/core';

import type Meal from '@/models/Meal';
import { useModelCollection } from '@aerogel/plugin-soukai';
import Recipe from '@/models/Recipe';
import { computed } from 'vue';

const { meal } = defineProps<{ meal: Meal }>();
const { close } = useModal();
const recipes = useModelCollection(Recipe);
const initialRecipe = recipes.value.find((recipe) => meal.recipe?.externalUrls.includes(recipe.url));
const recipesOptions = computed(() => (recipes.value as Array<Recipe | { id: 'none' }>).concat({ id: 'none' }));

const form = useForm({
    name: requiredStringInput(meal.recipe?.name),
    recipe: requiredObjectInput<Recipe | { id: 'none' }>(initialRecipe ?? { id: 'none' }),
    calories: requiredNumberInput(meal.recipe?.nutrition?.calories ?? 0),
    protein: numberInput(meal.recipe?.nutrition?.protein ?? 0),
    carbs: numberInput(meal.recipe?.nutrition?.carbs ?? 0),
    fat: numberInput(meal.recipe?.nutrition?.fat ?? 0),
    consumedAt: requiredDateInput(meal.consumedAt ?? meal.createdAt),
});

function isNone(recipe: Recipe | { id: 'none' }): recipe is { id: 'none' } {
    return recipe.id === 'none';
}

function renderRecipe(recipe: Recipe | { id: 'none' }) {
    if (isNone(recipe)) {
        return translate('logs.noRecipe');
    }

    return recipe.name;
}

async function submit() {
    close();

    const externalUrls = [...(meal.recipe?.externalUrls ?? [])];
    const recipe = meal.recipe ?? meal.relatedRecipe.attach();
    const nutrition = recipe.nutrition ?? recipe.relatedNutrition.attach();

    initialRecipe?.url && arrayRemove(externalUrls, initialRecipe.url);
    isNone(form.recipe) || externalUrls.push(form.recipe.url);

    meal.setAttributes({ consumedAt: form.consumedAt });
    recipe.setAttributes({ name: form.name, externalUrls });
    nutrition.setAttributes({
        rawCalories: `${round(form.calories ?? 0)} calories`,
        rawProtein: `${round(form.protein ?? 0, 2)} grams`,
        rawCarbs: `${round(form.carbs ?? 0, 2)} grams`,
        rawFat: `${round(form.fat ?? 0, 2)} grams`,
    });

    await meal.save();
}
</script>
