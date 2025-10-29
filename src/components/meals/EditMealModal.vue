<template>
    <Modal :title="$t('logs.editTitle', { name: meal.recipe?.name || $t('logs.meal') })" fullscreen-on-mobile>
        <Form :form class="flex flex-1 flex-col space-y-2" @submit="submit()">
            <Input name="name" :label="$t('logs.mealName')" />
            <Select
                name="recipe"
                :label="$t('logs.mealRecipe')"
                :options="recipesOptions"
                :render-option="renderRecipe"
                :compare-options="(a, b) => a.id === b.id"
            />

            <Input name="servings" step="0.1" :label="$t('logs.mealServings')" />
            <TextArea name="description" :label="$t('logs.mealDescription')" />

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
                        <Combobox
                            v-model="mealIngredient.name"
                            class="flex-1"
                            :placeholder="$t('logs.mealIngredientName')"
                            :options="ingredientNames"
                        />
                        <Input
                            :id="`ingredients-${index}-quantity`"
                            v-model="mealIngredient.quantity"
                            type="number"
                            step="0.01"
                            class="w-20"
                        />
                        <Select
                            v-model="mealIngredient.unit"
                            label-class="sr-only"
                            :label="$t('logs.mealIngredientUnit')"
                            :options="ingredientUnitOptions"
                            :render-option="(value) => $t(`logs.mealIngredientUnits.${value}`)"
                        />
                        <Button
                            :id="`ingredients-${index}-delete`"
                            variant="ghost"
                            class="text-red-500"
                            @click="mealIngredients.splice(index, 1)"
                        >
                            <i-lucide-trash2 class="size-4" />
                        </Button>
                    </div>
                </li>
            </ul>

            <Button
                v-if="hasCustomIngredients"
                variant="secondary"
                class="w-full"
                @click="mealIngredients.push({ name: '', quantity: 100, unit: 'grams' })"
            >
                {{ $t('logs.addIngredient') }}
            </Button>

            <Button
                v-else
                variant="secondary"
                class="w-full"
                @click="customizeIngredients()"
            >
                {{ $t('logs.mealIngredientsCustom') }}
            </Button>

            <template v-if="totalCalories && recalculate">
                <span class="self-end text-sm text-gray-600">
                    {{ $t('logs.totalCalories') }}: {{ formatNumber(totalCalories, 'calories') }}
                </span>

                <Details v-if="caloriesBreakdown?.length" :label="$t('logs.viewBreakdown')" class="overflow-y-auto">
                    <CaloriesBreakdown :breakdown="caloriesBreakdown" />
                </Details>
            </template>

            <Checkbox v-model="recalculate">
                <span class="text-sm">{{ $t('logs.editRecalculate') }}</span>
            </Checkbox>

            <Checkbox v-model="updateAll">
                <span class="text-sm">{{ $t('logs.editUpdateAll') }}</span>
            </Checkbox>

            <div class="grow" />

            <div class="mt-4 flex justify-end space-x-2">
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
import { arrayRemove, round } from '@noeldemartin/utils';
import {
    UI,
    numberInput,
    requiredDateInput,
    requiredObjectInput,
    requiredStringInput,
    stringInput,
    translate,
    useForm,
    useModal,
} from '@aerogel/core';

import Cookbook from '@/services/Cookbook';
import Pantry from '@/services/Pantry';
import Meal from '@/models/Meal';
import { computed, ref } from 'vue';
import { IngredientUnits, parseIngredient, parseMealIngredients } from '@/utils/ingredients';
import { type MealIngredient, getMealIngredientsCaloriesBreakdown } from '@/utils/meals';
import { formatNumber } from '@/utils/formatting';
import { getTrackedModels } from '@aerogel/plugin-soukai';
import type Recipe from '@/models/Recipe';
import type { CaloriesBreakdown as MealCaloriesBreakdown } from '@/models/Recipe';

const { meal } = defineProps<{ meal: Meal }>();
const { close } = useModal();
const recalculate = ref(false);
const updateAll = ref(false);
const initialRecipe = Cookbook.recipes.find((recipe) => meal.recipe?.externalUrls.includes(recipe.url));
const recipesOptions = computed(() => (Cookbook.recipes as Array<Recipe | { id: 'none' }>).concat({ id: 'none' }));
const ingredientNames = computed(() => Pantry.ingredients.map((ingredient) => ingredient.name));

const form = useForm({
    name: requiredStringInput(meal.recipe?.name),
    description: stringInput(meal.recipe?.description),
    recipe: requiredObjectInput<Recipe | { id: 'none' }>(initialRecipe ?? { id: 'none' }),
    servings: numberInput(meal.recipe?.servingsBreakdown?.quantity),
    calories: numberInput(meal.recipe?.nutrition?.calories ?? 0),
    protein: numberInput(meal.recipe?.nutrition?.protein ?? 0),
    carbs: numberInput(meal.recipe?.nutrition?.carbs ?? 0),
    fat: numberInput(meal.recipe?.nutrition?.fat ?? 0),
    consumedAt: requiredDateInput(meal.consumedAt ?? meal.createdAt),
});

const ingredientUnitOptions = computed(() => [IngredientUnits.Grams, IngredientUnits.Milliliters, 'servings'] as const);
const mealIngredients = ref<MealIngredient[]>(meal.recipe?.ingredients.length ? parseMealIngredients(meal) : []);
const hasCustomIngredients = ref(mealIngredients.value.length || isNone(form.recipe));
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

function customizeIngredients() {
    hasCustomIngredients.value = true;
    mealIngredients.value = parseMealIngredients(meal);
}

async function updateMeal(
    model: Meal,
    newIngredients: string[],
    mealCaloriesBreakdown: MealCaloriesBreakdown,
): Promise<void> {
    const externalUrls = [...(model.recipe?.externalUrls ?? [])];
    const recipe = model.recipe ?? model.relatedRecipe.attach();
    const nutrition = recipe.nutrition ?? recipe.relatedNutrition.attach();
    const calories = mealCaloriesBreakdown.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0);

    initialRecipe?.url && arrayRemove(externalUrls, initialRecipe.url);
    isNone(form.recipe) || externalUrls.push(form.recipe.url);

    recipe.setAttributes({ name: form.name, ingredients: newIngredients.slice(0), externalUrls });

    if (recalculate.value) {
        nutrition.setAttributes({
            rawCalories: `${round(calories)} calories`,
            rawProtein: `${round(
                mealCaloriesBreakdown.reduce((total, ingredient) => total + (ingredient.protein ?? 0), 0),
                2,
            )} grams`,
            rawCarbs: `${round(
                mealCaloriesBreakdown.reduce((total, ingredient) => total + (ingredient.carbs ?? 0), 0),
                2,
            )} grams`,
            rawFat: `${round(
                mealCaloriesBreakdown.reduce((total, ingredient) => total + (ingredient.fat ?? 0), 0),
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

    await model.save();
}

async function submit() {
    await close();
    await UI.loading(
        {
            delay: 300,
            message: translate('logs.updating'),
        },
        async () => {
            const newIngredients = mealIngredients.value.map((ingredient) => {
                switch (ingredient.unit) {
                    case 'grams':
                        return `${ingredient.quantity}g ${ingredient.name}`;
                    case 'milliliters':
                        return `${ingredient.quantity}ml ${ingredient.name}`;
                    case 'servings':
                        return `${ingredient.quantity} ${ingredient.name}`;
                }
            });

            if (recalculate.value) {
                for (const ingredient of newIngredients) {
                    await Pantry.resolveIngredient(parseIngredient(ingredient));
                }
            }

            const servings = form.servings ?? 1;
            const otherMeals = updateAll.value
                ? getTrackedModels(Meal).filter(
                    (other) => other.recipe?.name && other.recipe?.name === meal.recipe?.name,
                )
                : [];

            meal.setAttributes({ consumedAt: form.consumedAt, servings: form.servings });

            (meal.recipe ?? meal.relatedRecipe.attach()).setAttributes({ description: form.description });

            await updateMeal(meal, newIngredients, caloriesBreakdown.value);

            for (const model of otherMeals) {
                const otherMultiplier = (model.recipe?.servingsBreakdown?.quantity ?? 1) / servings;
                const otherIngredients = mealIngredients.value.map((ingredient) => {
                    switch (ingredient.unit) {
                        case 'grams':
                            return `${ingredient.quantity * otherMultiplier}g ${ingredient.name}`;
                        case 'milliliters':
                            return `${ingredient.quantity * otherMultiplier}ml ${ingredient.name}`;
                        case 'servings':
                            return `${ingredient.quantity * otherMultiplier} ${ingredient.name}`;
                    }
                });

                const otherBreakdown = getMealIngredientsCaloriesBreakdown(
                    mealIngredients.value.map((ingredient) => ({
                        ...ingredient,
                        quantity: ingredient.quantity * otherMultiplier,
                    })),
                );

                await updateMeal(model, otherIngredients, otherBreakdown);
            }
        },
    );
}
</script>
