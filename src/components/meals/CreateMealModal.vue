<template>
    <Modal :title="$t('logs.add')" fullscreen-on-mobile>
        <Form :form class="flex flex-1 flex-col space-y-2 overflow-y-auto" @submit="submit()">
            <Select
                name="meal"
                label-class="sr-only"
                :label="$t('logs.meal')"
                :options="mealOptions"
                :render-option="renderMeal"
                :compare-options="(a, b) => a.id === b.id"
            />
            <Select
                v-if="isInstanceOf(form.meal, Recipe)"
                name="servings"
                :options="servingsOptions"
                :render-option="renderServing"
            />
            <Input
                v-else-if="isInstanceOf(form.meal, Meal)"
                name="mealServings"
                step="0.1"
                :placeholder="$t('logs.mealServings')"
            />
            <template v-else>
                <Input name="name" :placeholder="$t('logs.mealName')" required />

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
                                :options="mealIngredientUnits"
                                :render-option="(value) => $t(`logs.mealIngredientUnits.${value}`)"
                            />
                            <Button variant="ghost" class="text-red-500" @click="mealIngredients.splice(index, 1)">
                                <i-lucide-trash2 class="size-4" />
                            </Button>
                        </div>
                    </li>
                </ul>
            </template>

            <Input name="consumedAt" type="datetime-local" />

            <template v-if="totalCalories">
                <span class="self-end text-sm text-gray-600">
                    {{ $t('logs.totalCalories') }}: {{ formatNumber(totalCalories, 'calories') }}
                </span>

                <Details v-if="caloriesBreakdown?.length" :label="$t('logs.viewBreakdown')" class="overflow-y-auto">
                    <CaloriesBreakdown :breakdown="caloriesBreakdown" />
                </Details>
            </template>

            <datalist v-if="!e2e" id="ingredient-names">
                <option v-for="ingredient in $pantry.ingredients" :key="ingredient.id" :value="ingredient.name" />
            </datalist>

            <div v-if="error" class="rounded-md bg-red-50 p-2 text-sm text-red-500">
                {{ error }}
            </div>

            <Button
                v-if="form.meal.id === 'new'"
                variant="secondary"
                class="w-full"
                @click="mealIngredients.push({ name: '', quantity: 100, unit: 'grams' })"
            >
                {{ $t('logs.addIngredient') }}
            </Button>

            <div class="grow" />

            <Button submit class="w-full">
                {{ $t('logs.log') }}
            </Button>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import {
    arraySorted,
    arrayUnique,
    compare,
    isInstanceOf,
    isTesting,
    range,
    required,
    round,
    toString,
} from '@noeldemartin/utils';
import {
    UI,
    numberInput,
    requiredDateInput,
    requiredObjectInput,
    stringInput,
    translate,
    useForm,
    useModal,
} from '@aerogel/core';
import { computed, ref, watch } from 'vue';
import { useModelCollection } from '@aerogel/plugin-soukai';
import type { Nullable } from '@noeldemartin/utils';

import Recipe, { type CaloriesBreakdown } from '@/models/Recipe';
import Meal from '@/models/Meal';
import Pantry from '@/services/Pantry';
import { formatNumber } from '@/utils/formatting';
import { parseIngredient } from '@/utils/ingredients';
import { type MealIngredient, getMealIngredientsCaloriesBreakdown, mealIngredientUnits } from '@/utils/meals';

interface Nutrition {
    calories: Nullable<number>;
    fat: Nullable<number>;
    protein: Nullable<number>;
    carbs: Nullable<number>;
}

const { close } = useModal();
const error = ref('');
const recipes = useModelCollection(Recipe);
const meals = useModelCollection(Meal);

const mealOptions = computed(() => {
    const mealNames = new Set<string>();
    const uniqueMeals: Meal[] = [];

    for (const meal of meals.value) {
        if (!meal.recipe || meal.recipe.externalUrls.length > 0 || mealNames.has(meal.recipe.name)) {
            continue;
        }

        mealNames.add(meal.recipe.name);
        uniqueMeals.push(meal);
    }

    const recipesAndMeals = (recipes.value as Array<Recipe | Meal | { id: 'new' }>).concat(uniqueMeals);

    return arraySorted(recipesAndMeals, (a, b) => compare(renderMeal(a), renderMeal(b))).concat({ id: 'new' });
});

const form = useForm({
    meal: requiredObjectInput<Recipe | Meal | { id: 'new' }>(mealOptions.value[0] ?? { id: 'new' }),
    name: stringInput(),
    servings: numberInput(),
    mealServings: numberInput(1),
    consumedAt: requiredDateInput(new Date()),
});
const mealIngredients = ref<MealIngredient[]>([]);
const renderServing = computed(() =>
    form.meal instanceof Recipe ? (form.meal.servingsBreakdown?.renderQuantity ?? toString) : toString);
const servingsOptions = computed(() => {
    if (!isInstanceOf(form.meal, Recipe)) {
        return [];
    }

    const servingsBreakdown = form.meal.servingsBreakdown;
    const defaultQuantity = servingsBreakdown?.quantity ?? 1;

    if (!servingsBreakdown) {
        return range(10).map((quantity) => quantity + 1);
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
const caloriesBreakdown = computed(() => {
    if (isNewMeal(form.meal)) {
        return getMealIngredientsCaloriesBreakdown(mealIngredients.value);
    }

    const recipe = isInstanceOf(form.meal, Recipe) ? form.meal : form.meal.recipe;
    const servings = isInstanceOf(form.meal, Recipe) ? form.servings : form.mealServings;
    const originalServings = recipe?.servingsBreakdown?.quantity ?? 1;
    const ingredientsMultiplier = servings ? servings / (originalServings ?? 1) : 1;

    return recipe?.getCaloriesBreakdown(ingredientsMultiplier);
});
const totalCalories = computed(() =>
    caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0));

const e2e = isTesting('e2e');

watch(
    () => form.meal,
    () => {
        if (!isInstanceOf(form.meal, Recipe)) {
            return;
        }

        const defaultQuantity = form.meal.servingsBreakdown?.quantity ?? 1;
        form.servings = servingsOptions.value.find((option) => option === defaultQuantity) ?? servingsOptions.value[0];
    },
    { immediate: true },
);

function isNewMeal(meal: Recipe | Meal | { id: 'new' }): meal is { id: 'new' } {
    return meal.id === 'new';
}

async function submit() {
    error.value = '';

    if (form.meal instanceof Recipe) {
        await logRecipe(form.meal);

        return;
    }

    if (form.meal instanceof Meal) {
        await logMeal(form.meal);

        return;
    }

    await logNewMeal();
}

function renderMeal(meal: Recipe | Meal | { id: 'new' }) {
    if (meal instanceof Meal) {
        return meal.recipe?.name ?? '';
    }

    if (meal instanceof Recipe) {
        return meal.name;
    }

    return translate('logs.addNew');
}

function applyIngredientNutrition(
    ingredient: CaloriesBreakdown[number],
    nutrition: Nutrition,
    property: keyof Nutrition,
) {
    if (typeof ingredient?.[property] !== 'number') {
        return;
    }

    nutrition[property] ??= 0;
    nutrition[property] += ingredient[property];
}
function ingredientNotFound(name: string) {
    // eslint-disable-next-line no-console
    console.warn(`Cannot calculate nutrition for ingredient: ${name}`);

    UI.toast(`Cannot calculate nutrition for ingredient: ${name}`, {
        variant: 'warning',
    });
}

async function calculateRecipeNutrition(recipe: Recipe): Promise<Nutrition> {
    for (const breakdown of recipe.ingredientsBreakdown) {
        await Pantry.resolveIngredient(breakdown);
    }

    const originalServings = recipe.servingsBreakdown?.quantity;
    const ingredientsMultiplier = form.servings ? form.servings / (originalServings ?? 1) : 1;

    const breakdown = recipe.getCaloriesBreakdown(ingredientsMultiplier);
    const nutrition: Nutrition = {
        calories: null,
        fat: null,
        protein: null,
        carbs: null,
    };

    for (const ingredient of breakdown) {
        if (typeof ingredient.calories !== 'number') {
            ingredientNotFound(ingredient.name);

            continue;
        }

        applyIngredientNutrition(ingredient, nutrition, 'calories');
        applyIngredientNutrition(ingredient, nutrition, 'fat');
        applyIngredientNutrition(ingredient, nutrition, 'protein');
        applyIngredientNutrition(ingredient, nutrition, 'carbs');
    }

    nutrition.calories = nutrition.calories && round(nutrition.calories);
    nutrition.fat = nutrition.fat && round(nutrition.fat, 2);
    nutrition.protein = nutrition.protein && round(nutrition.protein, 2);
    nutrition.carbs = nutrition.carbs && round(nutrition.carbs, 2);

    return nutrition;
}

async function logNewMeal() {
    const { name } = form;
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

    name || form.setFieldErrors('name', ['required']);

    if (!name) {
        return;
    }

    await close();
    await UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            for (const ingredient of renderedIngredients) {
                await Pantry.resolveIngredient(parseIngredient(ingredient));
            }

            await createMeal(
                name,
                {
                    calories: totalCalories.value ?? 0,
                    fat: caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.fat ?? 0), 0) ?? 0,
                    protein:
                        caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.protein ?? 0), 0) ??
                        0,
                    carbs:
                        caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.carbs ?? 0), 0) ?? 0,
                },
                { ingredients: renderedIngredients },
            );
        },
    );
}

async function logMeal(meal: Meal) {
    await close();
    await UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            const servings = form.mealServings ?? 1;
            const nutrition = {
                calories: meal.recipe?.nutrition?.calories ? meal.recipe?.nutrition?.calories * servings : 0,
                protein: meal.recipe?.nutrition?.protein ? meal.recipe?.nutrition?.protein * servings : 0,
                carbs: meal.recipe?.nutrition?.carbs ? meal.recipe?.nutrition?.carbs * servings : 0,
                fat: meal.recipe?.nutrition?.fat ? meal.recipe?.nutrition?.fat * servings : 0,
            };

            await createMeal(required(meal.recipe?.name), nutrition, {
                servings: servings !== 1 ? formatNumber(servings) : undefined,
                ingredients: caloriesBreakdown.value?.map((ingredient) => ingredient.name),
            });
        },
    );
}

async function logRecipe(recipe: Recipe) {
    await close();
    await UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            const nutrition = await calculateRecipeNutrition(recipe);

            await createMeal(recipe.name, nutrition, {
                servings:
                    form.servings && recipe.servingsBreakdown
                        ? recipe.servingsBreakdown.renderQuantity(form.servings)
                        : form.servings !== 1
                            ? (form.servings ?? recipe.servings)?.toString()
                            : undefined,
                externalUrls: [recipe.url],
            });
        },
    );
}

async function createMeal(
    name: string,
    nutrition: Nutrition,
    extra: {
        servings?: string;
        externalUrls?: string[];
        ingredients?: string[];
    } = {},
) {
    const meal = new Meal({ consumedAt: form.consumedAt });
    const mealRecipe = meal.relatedRecipe.attach({
        name,
        servings: extra.servings,
        externalUrls: extra.externalUrls,
        ingredients: extra.ingredients,
    });

    if (nutrition.calories || nutrition.protein || nutrition.carbs || nutrition.fat) {
        mealRecipe.relatedNutrition.attach({
            rawCalories: typeof nutrition.calories === 'number' ? `${round(nutrition.calories)} calories` : undefined,
            rawProtein: typeof nutrition.protein === 'number' ? `${round(nutrition.protein, 2)} grams` : undefined,
            rawCarbs: typeof nutrition.carbs === 'number' ? `${round(nutrition.carbs, 2)} grams` : undefined,
            rawFat: typeof nutrition.fat === 'number' ? `${round(nutrition.fat, 2)} grams` : undefined,
        });
    }

    await meal.save();
}
</script>
