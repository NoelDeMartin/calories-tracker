<template>
    <Modal :title="$t('logs.add')" class="flex flex-col">
        <Form :form class="flex flex-col space-y-2 overflow-y-auto" @submit="submit()">
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
                :placeholder="$t('logs.addServings')"
            />
            <template v-else>
                <Input name="name" :placeholder="$t('logs.addName')" required />
                <Input name="calories" :placeholder="$t('logs.addCalories')" required />
                <Input name="protein" :placeholder="$t('logs.addProtein')" />
                <Input name="carbs" :placeholder="$t('logs.addCarbs')" />
                <Input name="fat" :placeholder="$t('logs.addFat')" />
            </template>

            <Input name="consumedAt" type="datetime-local" />

            <template v-if="caloriesBreakdown?.length">
                <span class="self-end text-sm text-gray-600">
                    {{ $t('logs.totalCalories') }}: {{ formatNumber(totalCalories, 'calories') }}
                </span>

                <Details :label="$t('logs.viewBreakdown')" class="overflow-y-auto">
                    <CaloriesBreakdown :breakdown="caloriesBreakdown" />
                </Details>
            </template>

            <div v-if="error" class="rounded-md bg-red-50 p-2 text-sm text-red-500">
                {{ error }}
            </div>
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
    isInstanceOf,
    map,
    range,
    required,
    round,
    stringToSlug,
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
import Ingredient from '@/models/Ingredient';
import Nutritionix from '@/services/Nutritionix';
import { formatNumber } from '@/utils/formatting';
import type { IngredientBreakdown } from '@/utils/ingredients';

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
const ingredients = useModelCollection(Ingredient);
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

    return (recipes.value as Array<Recipe | Meal | { id: 'new' }>).concat(uniqueMeals).concat({ id: 'new' });
});
const form = useForm({
    meal: requiredObjectInput<Recipe | Meal | { id: 'new' }>(recipes.value[0] ?? meals.value[0] ?? { id: 'new' }),
    name: stringInput(),
    servings: numberInput(),
    mealServings: numberInput(1),
    calories: numberInput(),
    protein: numberInput(),
    carbs: numberInput(),
    fat: numberInput(),
    consumedAt: requiredDateInput(new Date()),
});
const renderServing = computed(() =>
    form.meal instanceof Recipe ? (form.meal.servingsBreakdown?.renderQuantity ?? toString) : toString);
const ingredientsMap = computed(() => map(ingredients.value, 'name'));
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
    if (!isInstanceOf(form.meal, Recipe)) {
        return;
    }

    const originalServings = form.meal.servingsBreakdown?.quantity;
    const ingredientsMultiplier = form.servings ? form.servings / (originalServings ?? 1) : 1;

    return form.meal.getCaloriesBreakdown(ingredientsMultiplier, ingredientsMap.value);
});
const totalCalories = computed(() =>
    caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0));

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

async function resolveIngredient({ template }: IngredientBreakdown): Promise<Ingredient> {
    const name = template
        .replace('{quantity}', '')
        .trim()
        .replace(/\s*\(optional\)/, '');

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
        await resolveIngredient(breakdown);
    }

    const originalServings = recipe.servingsBreakdown?.quantity;
    const ingredientsMultiplier = form.servings ? form.servings / (originalServings ?? 1) : 1;

    const breakdown = recipe.getCaloriesBreakdown(ingredientsMultiplier, ingredientsMap.value);
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
    const { name, calories, protein, carbs, fat } = form;

    name || form.setFieldErrors('name', ['required']);
    calories || form.setFieldErrors('calories', ['required']);

    if (!name || !calories) {
        return;
    }

    close();

    UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            await createMeal(name, {
                calories,
                fat: fat || 0,
                protein: protein || 0,
                carbs: carbs || 0,
            });
        },
    );
}

async function logMeal(meal: Meal) {
    close();

    UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            const servings = form.mealServings ?? 1;
            const nutrition = {
                calories: meal.recipe?.nutrition?.calories ? meal.recipe?.nutrition?.calories * servings : undefined,
                protein: meal.recipe?.nutrition?.protein ? meal.recipe?.nutrition?.protein * servings : undefined,
                carbs: meal.recipe?.nutrition?.carbs ? meal.recipe?.nutrition?.carbs * servings : undefined,
                fat: meal.recipe?.nutrition?.fat ? meal.recipe?.nutrition?.fat * servings : undefined,
            };

            await createMeal(
                required(meal.recipe?.name),
                nutrition,
                servings !== 1 ? formatNumber(servings) : undefined,
            );
        },
    );
}

async function logRecipe(recipe: Recipe) {
    close();

    UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            const nutrition = await calculateRecipeNutrition(recipe);

            await createMeal(
                recipe.name,
                nutrition,
                form.servings && recipe.servingsBreakdown
                    ? recipe.servingsBreakdown.renderQuantity(form.servings)
                    : form.servings !== 1
                        ? (form.servings ?? recipe.servings)?.toString()
                        : undefined,
                [recipe.url],
            );
        },
    );
}

async function createMeal(name: string, nutrition: Nutrition, servings?: string, externalUrls?: string[]) {
    const meal = new Meal({ consumedAt: form.consumedAt });
    const mealRecipe = meal.relatedRecipe.attach({ name, servings, externalUrls });

    if (nutrition.calories || nutrition.protein || nutrition.carbs || nutrition.fat) {
        mealRecipe.relatedNutrition.attach({
            rawCalories: typeof nutrition.calories === 'number' ? `${nutrition.calories} calories` : undefined,
            rawProtein: typeof nutrition.protein === 'number' ? `${nutrition.protein} grams` : undefined,
            rawCarbs: typeof nutrition.carbs === 'number' ? `${nutrition.carbs} grams` : undefined,
            rawFat: typeof nutrition.fat === 'number' ? `${nutrition.fat} grams` : undefined,
        });
    }

    await meal.save();
}
</script>
