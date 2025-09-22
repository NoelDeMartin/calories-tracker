<template>
    <Modal :title="$t('logs.editTitle', { name: meal.recipe?.name || $t('logs.meal') })" fullscreen-mobile>
        <Form :form class="flex flex-1 flex-col space-y-2" @submit="submit()">
            <Input name="name" :label="$t('logs.mealName')" />
            <Select
                name="recipe"
                :label="$t('logs.mealRecipe')"
                :options="recipesOptions"
                :render-option="renderRecipe"
                :compare-options="(a, b) => a.id === b.id"
            />

            <template v-if="!recalculate">
                <Input name="calories" :label="$t('logs.mealCalories')" step="0.01" />
                <Input name="protein" :label="$t('logs.mealProtein')" step="0.01" />
                <Input name="carbs" :label="$t('logs.mealCarbs')" step="0.01" />
                <Input name="fat" :label="$t('logs.mealFat')" step="0.01" />
            </template>

            <Input name="consumedAt" :label="$t('logs.mealConsumedAt')" type="datetime-local" />

            <h2 class="text-sm font-medium">
                {{ $t('logs.mealIngredients') }}
            </h2>
            <ul class="space-y-2 overflow-y-auto" :class="{ hidden: mealIngredients.length === 0 }">
                <li class="grid grid-cols-1 gap-2">
                    <div v-for="(mealIngredient, index) in mealIngredients" :key="index" class="flex space-x-2">
                        <Input
                            v-model="mealIngredient.name"
                            class="flex-1"
                            list="ingredient-names"
                            :placeholder="$t('logs.mealIngredientName')"
                        />
                        <Input
                            :id="`ingredients-${index}-quantity`"
                            v-model="mealIngredient.quantity"
                            type="number"
                            step="0.1"
                            class="w-20"
                        />
                        <Select
                            v-model="mealIngredient.unit"
                            label-class="sr-only"
                            :label="$t('logs.mealIngredientUnit')"
                            :options="ingredientUnitOptions"
                            :render-option="(value) => $t(`logs.mealIngredientUnits.${value}`)"
                        />
                        <Button variant="ghost" class="text-red-500" @click="mealIngredients.splice(index, 1)">
                            <i-lucide-trash2 class="size-4" />
                        </Button>
                    </div>
                </li>
            </ul>

            <datalist v-if="!e2e" id="ingredient-names">
                <option v-for="ingredient in $pantry.ingredients" :key="ingredient.id" :value="ingredient.name" />
            </datalist>

            <Button
                variant="secondary"
                class="w-full"
                @click="mealIngredients.push({ name: '', quantity: 100, unit: 'grams' })"
            >
                {{ $t('logs.addIngredient') }}
            </Button>

            <template v-if="totalCalories && recalculate">
                <span class="self-end text-sm text-gray-600">
                    {{ $t('logs.totalCalories') }}: {{ formatNumber(totalCalories, 'calories') }}
                </span>

                <Details v-if="caloriesBreakdown?.length" :label="$t('logs.viewBreakdown')" class="overflow-y-auto">
                    <CaloriesBreakdown :breakdown="caloriesBreakdown" />
                </Details>
            </template>

            <div class="grow" />

            <div class="mt-4 flex justify-end space-x-2">
                <Checkbox v-model="recalculate">
                    <span class="text-sm">{{ $t('logs.editRecalculate') }}</span>
                </Checkbox>
                <span class="flex-grow" />
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
import { arrayRemove, isTesting, round } from '@noeldemartin/utils';
import {
    UI,
    numberInput,
    requiredDateInput,
    requiredObjectInput,
    requiredStringInput,
    translate,
    useForm,
    useModal,
} from '@aerogel/core';

import Pantry from '@/services/Pantry';
import Recipe from '@/models/Recipe';
import type Meal from '@/models/Meal';
import { useModelCollection } from '@aerogel/plugin-soukai';
import { computed, ref } from 'vue';
import { IngredientUnits, parseIngredient } from '@/utils/ingredients';
import { getMealIngredientsCaloriesBreakdown } from '@/utils/meals';
import { formatNumber } from '@/utils/formatting';

const { meal } = defineProps<{ meal: Meal }>();
const { close } = useModal();
const recalculate = ref(false);
const recipes = useModelCollection(Recipe);
const initialRecipe = recipes.value.find((recipe) => meal.recipe?.externalUrls.includes(recipe.url));
const recipesOptions = computed(() => (recipes.value as Array<Recipe | { id: 'none' }>).concat({ id: 'none' }));

const form = useForm({
    name: requiredStringInput(meal.recipe?.name),
    recipe: requiredObjectInput<Recipe | { id: 'none' }>(initialRecipe ?? { id: 'none' }),
    calories: numberInput(meal.recipe?.nutrition?.calories ?? 0),
    protein: numberInput(meal.recipe?.nutrition?.protein ?? 0),
    carbs: numberInput(meal.recipe?.nutrition?.carbs ?? 0),
    fat: numberInput(meal.recipe?.nutrition?.fat ?? 0),
    consumedAt: requiredDateInput(meal.consumedAt ?? meal.createdAt),
});

const ingredientUnitOptions = computed(() => [IngredientUnits.Grams, IngredientUnits.Milliliters, 'servings'] as const);
const mealIngredients = ref<{ name: string; quantity: number; unit: (typeof ingredientUnitOptions.value)[number] }[]>(
    meal.recipe?.ingredientsBreakdown?.map(({ template, quantity, unit }) => ({
        name: template
            .replace('{quantity}', '')
            .trim()
            .replace(/\s*\(optional\)/, ''),
        quantity: typeof quantity === 'number' ? quantity : 1,
        unit: unit ?? 'servings',
    })) ?? []);
const e2e = isTesting('e2e');

const caloriesBreakdown = computed(() => getMealIngredientsCaloriesBreakdown(mealIngredients.value));
const totalCalories = computed(() =>
    caloriesBreakdown.value.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0));

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
    await close();
    await UI.loading(
        {
            delay: 300,
            message: translate('logs.updating'),
        },
        async () => {
            const externalUrls = [...(meal.recipe?.externalUrls ?? [])];
            const recipe = meal.recipe ?? meal.relatedRecipe.attach();
            const nutrition = recipe.nutrition ?? recipe.relatedNutrition.attach();
            const ingredients = recipe.ingredients?.slice(0) ?? [];
            const renderedIngredients = mealIngredients.value.map((ingredient) => {
                switch (ingredient.unit) {
                    case 'grams':
                        return `${ingredient.quantity}g ${ingredient.name}`;
                    case 'milliliters':
                        return `${ingredient.quantity}ml ${ingredient.name}`;
                    case 'servings':
                        return `${ingredient.quantity} ${ingredient.name}`;
                }
            });

            for (const ingredient of renderedIngredients) {
                if (ingredients.includes(ingredient)) {
                    continue;
                }

                ingredients.push(ingredient);
            }

            for (const ingredient of ingredients) {
                if (renderedIngredients.includes(ingredient)) {
                    continue;
                }

                arrayRemove(ingredients, ingredient);
            }

            initialRecipe?.url && arrayRemove(externalUrls, initialRecipe.url);
            isNone(form.recipe) || externalUrls.push(form.recipe.url);

            meal.setAttributes({ consumedAt: form.consumedAt });
            recipe.setAttributes({ name: form.name, ingredients, externalUrls });

            if (recalculate.value) {
                for (const ingredient of renderedIngredients) {
                    await Pantry.resolveIngredient(parseIngredient(ingredient));
                }

                nutrition.setAttributes({
                    rawCalories: `${round(totalCalories.value)} calories`,
                    rawProtein: `${round(
                        caloriesBreakdown.value.reduce((total, ingredient) => total + (ingredient.protein ?? 0), 0),
                        2,
                    )} grams`,
                    rawCarbs: `${round(
                        caloriesBreakdown.value.reduce((total, ingredient) => total + (ingredient.carbs ?? 0), 0),
                        2,
                    )} grams`,
                    rawFat: `${round(
                        caloriesBreakdown.value.reduce((total, ingredient) => total + (ingredient.fat ?? 0), 0),
                        2,
                    )} grams`,
                });
            } else {
                nutrition.setAttributes({
                    rawCalories: `${round(form.calories ?? 0)} calories`,
                    rawProtein: `${round(form.protein ?? 0, 2)} grams`,
                    rawCarbs: `${round(form.carbs ?? 0, 2)} grams`,
                    rawFat: `${round(form.fat ?? 0, 2)} grams`,
                });
            }

            await meal.save();
        },
    );
}
</script>
