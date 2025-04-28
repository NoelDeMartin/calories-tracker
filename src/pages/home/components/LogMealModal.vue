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
import { arraySorted, arrayUnique, map, range, round, stringToSlug, toString } from '@noeldemartin/utils';
import { computed, useTemplateRef, watchEffect } from 'vue';
import { UI, numberInput, requiredObjectInput, translate, useForm } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-soukai';
import type { Nullable } from '@noeldemartin/utils';

import Recipe from '@/models/Recipe';
import Meal from '@/models/Meal';
import Ingredient from '@/models/Ingredient';
import Nutritionix from '@/services/Nutritionix';
import type { IngredientBreakdown } from '@/utils/ingredients';

interface Nutrition {
    calories: Nullable<number>;
    fat: Nullable<number>;
    protein: Nullable<number>;
    carbs: Nullable<number>;
}

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

async function resolveIngredient({ template }: IngredientBreakdown): Promise<Ingredient> {
    const name = template.replace('{quantity}', '').trim();

    if (ingredientsMap.value.hasKey(name)) {
        return ingredientsMap.value.require(name);
    }

    const ingredient = new Ingredient({ name });
    const nutrition = await Nutritionix.getNutrition(name);

    if (nutrition) {
        ingredient.externalUrls = [`https://www.nutritionix.com/food/${stringToSlug(nutrition.name)}`];
        ingredient.relatedNutrition.attach({
            serving: nutrition.serving,
            rawCalories: typeof nutrition.calories === 'number' ? `${round(nutrition.calories)} calories` : undefined,
            rawProtein: typeof nutrition.protein === 'number' ? `${round(nutrition.protein, 2)} grams` : undefined,
            rawCarbs: typeof nutrition.carbs === 'number' ? `${round(nutrition.carbs, 2)} grams` : undefined,
            rawFat: typeof nutrition.fat === 'number' ? `${round(nutrition.fat, 2)} grams` : undefined,
        });
    }

    await ingredient.save();

    return ingredient;
}

function applyIngredientNutrition(
    ingredient: Ingredient,
    nutrition: Nutrition,
    property: keyof Nutrition,
    multiplier: number,
) {
    if (typeof ingredient.nutrition?.[property] !== 'number') {
        return;
    }

    nutrition[property] ??= 0;
    nutrition[property] += ingredient.nutrition[property] * multiplier;
}

async function calculateNutrition(): Promise<Nutrition> {
    const nutrition: Nutrition = {
        calories: null,
        fat: null,
        protein: null,
        carbs: null,
    };

    const originalServings = form.recipe.servingsBreakdown?.quantity;
    const ingredientsMultiplier = form.servings ? form.servings / (originalServings ?? form.servings) : 1;

    for (const ingredientBreakdown of form.recipe.ingredientsBreakdown) {
        if (ingredientBreakdown.unit !== 'grams' || typeof ingredientBreakdown.quantity !== 'number') {
            console.warn('Cannot calculate nutrition for ingredient: ' + ingredientBreakdown.original);

            continue;
        }

        const ingredient = await resolveIngredient(ingredientBreakdown);
        const multiplier = ingredientsMultiplier * (ingredientBreakdown.quantity / 100);

        applyIngredientNutrition(ingredient, nutrition, 'calories', multiplier);
        applyIngredientNutrition(ingredient, nutrition, 'fat', multiplier);
        applyIngredientNutrition(ingredient, nutrition, 'protein', multiplier);
        applyIngredientNutrition(ingredient, nutrition, 'carbs', multiplier);
    }

    nutrition.calories = nutrition.calories && round(nutrition.calories);
    nutrition.fat = nutrition.fat && round(nutrition.fat, 2);
    nutrition.protein = nutrition.protein && round(nutrition.protein, 2);
    nutrition.carbs = nutrition.carbs && round(nutrition.carbs, 2);

    return nutrition;
}

async function submit() {
    $modal.value?.close();

    UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            const nutrition = await calculateNutrition();
            const meal = new Meal();
            const mealRecipe = meal.relatedRecipe.attach({
                name: form.recipe.name,
                servings:
                    form.servings && form.recipe.servingsBreakdown
                        ? form.recipe.servingsBreakdown.renderQuantity(form.servings)
                        : form.recipe.servings,
                externalUrls: [form.recipe.url],
            });

            if (nutrition.calories || nutrition.protein || nutrition.carbs || nutrition.fat) {
                mealRecipe.relatedNutrition.attach({
                    rawCalories: nutrition.calories ? `${nutrition.calories} calories` : undefined,
                    rawProtein: nutrition.protein ? `${nutrition.protein} grams` : undefined,
                    rawCarbs: nutrition.carbs ? `${nutrition.carbs} grams` : undefined,
                    rawFat: nutrition.fat ? `${nutrition.fat} grams` : undefined,
                });
            }

            await meal.save();
        },
    );
}
</script>
