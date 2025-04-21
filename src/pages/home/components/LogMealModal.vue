<template>
    <Modal ref="$modalRef" :title="$t('logs.add')">
        <Form :form="form" class="space-y-2" @submit="submit()">
            <Select
                name="recipe"
                :options="recipes"
                :render-option="(recipe) => recipe.name"
                :compare-options="(a, b) => a.url === b.url"
            />
            <Select name="servings" :options="servings" :render-option="renderServing" />
            <Button submit class="w-full">
                {{ $t('logs.log') }}
            </Button>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { arraySorted, arrayUnique, map, randomInt, range, toString } from '@noeldemartin/utils';
import { computed, useTemplateRef, watchEffect } from 'vue';
import { numberInput, requiredObjectInput, useForm } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-soukai';

import Recipe from '@/models/Recipe';
import Meal from '@/models/Meal';
import Ingredient from '@/models/Ingredient';

const $modal = useTemplateRef('$modalRef');
const recipes = useModelCollection(Recipe);
const ingredients = useModelCollection(Ingredient);
const form = useForm({
    recipe: requiredObjectInput(recipes.value[0]),
    servings: numberInput(),
});
const renderServing = computed(() => form.recipe.servingsBreakdown?.renderQuantity ?? toString);
const ingredientsMap = computed(() => map(ingredients.value, 'name'));
const servings = computed(() => {
    const servingsBreakdown = form.recipe.servingsBreakdown;
    const defaultQuantity = servingsBreakdown?.quantity ?? 1;

    if (!servingsBreakdown) {
        return range(10);
    }

    return arraySorted(
        arrayUnique([
            ...range(10)
                .map((quantity) => quantity + 1)
                .map((quantity) => quantity * 10 ** Math.floor(Math.log10(defaultQuantity))),
            defaultQuantity,
        ]),
        (a, b) => (a > b ? 1 : -1),
    );
});

watchEffect(() => {
    if (!form.servings || servings.value.includes(form.servings)) {
        return;
    }

    form.servings = null;
});

async function prepareIngredients() {
    for (const { template } of form.recipe.ingredientsBreakdown) {
        const name = template.replace('{quantity}', '').trim();

        if (ingredientsMap.value.hasKey(name)) {
            continue;
        }

        const ingredient = new Ingredient({ name });

        ingredient.relatedNutrition.attach({
            serving: '100 grams',
            rawCalories: `${randomInt(100, 1000)} calories`,
            rawProtein: `${randomInt(10, 100)} grams`,
            rawCarbs: `${randomInt(10, 100)} grams`,
            rawFat: `${randomInt(10, 100)} grams`,
        });

        await ingredient.save();
    }
}

async function submit() {
    await prepareIngredients();

    const meal = new Meal();
    const mealRecipe = meal.relatedRecipe.attach({ name: form.recipe.name, sameAs: [form.recipe.url] });

    mealRecipe.relatedNutrition.attach({
        rawCalories: `${randomInt(100, 1000)} calories`,
        rawProtein: `${randomInt(10, 100)} grams`,
        rawCarbs: `${randomInt(10, 100)} grams`,
        rawFat: `${randomInt(10, 100)} grams`,
    });

    await meal.save();

    $modal.value?.close();
}
</script>
