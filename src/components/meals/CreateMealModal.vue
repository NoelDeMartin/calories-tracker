<template>
    <Modal :title="$t('logs.add')" fullscreen-on-mobile>
        <Form :form class="flex flex-1 flex-col space-y-2 overflow-y-auto" @submit="submit()">
            <Combobox
                name="meal"
                label-class="sr-only"
                :label="$t('logs.meal')"
                :options="mealOptions"
                :render-option="renderMeal"
                :compare-options="(a, b) => a.id === b.id"
                :placeholder="$t('logs.mealPlaceholder')"
                :new-input-value="(value) => ({ id: 'new-meal', name: value }) as NewMeal"
            />

            <Select
                v-if="isInstanceOf(form.meal, Recipe)"
                name="servings"
                :options="servingsOptions"
                :render-option="renderServing"
            />

            <Input
                v-if="form.servings === -1 || isInstanceOf(form.meal, Meal)"
                name="mealServings"
                step="0.1"
                :placeholder="$t('logs.mealServings')"
            />

            <ul
                v-if="isNewMeal(form.meal) || customizeIngredients"
                class="space-y-2 overflow-y-auto"
                :class="{ hidden: mealIngredients.length === 0 }"
            >
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
                            :options="mealIngredientUnits"
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

            <Input name="consumedAt" type="datetime-local" />

            <div v-if="error" class="rounded-md bg-red-50 p-2 text-sm text-red-500">
                {{ error }}
            </div>

            <Button
                v-if="isNewMeal(form.meal) || customizeIngredients"
                variant="secondary"
                class="w-full"
                @click="mealIngredients.push({ name: '', quantity: 100, unit: 'grams' })"
            >
                {{ $t('logs.addIngredient') }}
            </Button>

            <Checkbox
                v-if="!isNewMeal(form.meal)"
                v-model="customizeIngredients"
                :label="$t('logs.mealIngredientsCustom')"
            />

            <template v-if="totalCalories">
                <span class="self-end text-sm text-gray-600">
                    {{ $t('logs.totalCalories') }}: {{ formatNumber(totalCalories, 'calories') }}
                </span>

                <Details v-if="caloriesBreakdown?.length" :label="$t('logs.viewBreakdown')" class="overflow-y-auto">
                    <CaloriesBreakdown :breakdown="caloriesBreakdown" />
                </Details>
            </template>

            <div class="grow" />

            <Button submit class="w-full">
                {{ $t('logs.log') }}
            </Button>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { arraySorted, arrayUnique, compare, isInstanceOf, range, required, round, toString } from '@noeldemartin/utils';
import { UI, numberInput, requiredDateInput, requiredObjectInput, translate, useForm, useModal } from '@aerogel/core';
import { computed, ref, watch } from 'vue';
import { useModelCollection } from '@aerogel/plugin-soukai';

import Cookbook from '@/services/Cookbook';
import Recipe, { type CaloriesBreakdown } from '@/models/Recipe';
import Meal from '@/models/Meal';
import Pantry from '@/services/Pantry';
import { formatNumber } from '@/utils/formatting';
import { parseIngredient, parseMealIngredients } from '@/utils/ingredients';
import { type MealIngredient, getMealIngredientsCaloriesBreakdown, mealIngredientUnits } from '@/utils/meals';
import { type NewMeal, isNewMeal } from '@/components/meals';
import type { Nutrition } from '@/models/NutritionInformation';

const { close } = useModal();
const error = ref('');
const meals = useModelCollection(Meal);
const customizeIngredients = ref(false);
const ingredientNames = computed(() => Pantry.ingredients.map((ingredient) => ingredient.name));

const mealOptions = computed(() => {
    const mealNames = new Set<string>();
    const uniqueMealsAndRecipes: (Meal | Recipe | NewMeal)[] = [];

    for (const meal of meals.value) {
        if (!meal.recipe || meal.recipe.externalUrls.length > 0 || mealNames.has(meal.recipe.name)) {
            continue;
        }

        mealNames.add(meal.recipe.name);
        uniqueMealsAndRecipes.push(meal);
    }

    for (const recipe of Cookbook.recipes) {
        if (mealNames.has(recipe.name)) {
            continue;
        }

        mealNames.add(recipe.name);
        uniqueMealsAndRecipes.push(recipe);
    }

    return arraySorted(uniqueMealsAndRecipes, (a, b) => compare(renderMeal(a), renderMeal(b)));
});

const form = useForm({
    meal: requiredObjectInput<Recipe | Meal | NewMeal>({ id: 'new-meal', name: '' }, { rules: ['required-meal'] }),
    servings: numberInput(),
    mealServings: numberInput(1),
    consumedAt: requiredDateInput(new Date()),
});
const mealIngredients = ref<MealIngredient[]>([]);
const renderServing = computed(() => (value: number) => {
    if (value === -1) {
        return translate('logs.mealServingsCustom');
    }

    const render = form.meal instanceof Recipe ? (form.meal.servingsBreakdown?.renderQuantity ?? toString) : toString;

    return render(value);
});
const servingsOptions = computed(() => {
    if (!isInstanceOf(form.meal, Recipe)) {
        return [];
    }

    const servingsBreakdown = form.meal.servingsBreakdown;
    const defaultQuantity = servingsBreakdown?.quantity ?? 1;

    if (!servingsBreakdown) {
        return range(10)
            .map((quantity) => quantity + 1)
            .concat(-1);
    }

    return arraySorted(
        arrayUnique([
            ...range(10)
                .map((quantity) => quantity + 1)
                .map((quantity) => quantity * 10 ** Math.floor(Math.log10(defaultQuantity))),
            defaultQuantity,
        ]),
        (a, b) => (a > b ? 1 : -1),
    ).concat(-1);
});
const caloriesBreakdown = computed(() => {
    if (isNewMeal(form.meal) || customizeIngredients.value) {
        return getMealIngredientsCaloriesBreakdown(mealIngredients.value);
    }

    const recipe = isInstanceOf(form.meal, Recipe) ? form.meal : form.meal.recipe;
    const servings = isInstanceOf(form.meal, Recipe)
        ? form.servings === -1
            ? form.mealServings
            : form.servings
        : form.mealServings;
    const originalServings = recipe?.servingsBreakdown?.quantity ?? 1;
    const ingredientsMultiplier = servings ? servings / (originalServings ?? 1) : 1;

    return recipe?.getCaloriesBreakdown(ingredientsMultiplier);
});
const totalCalories = computed(() =>
    caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.calories ?? 0), 0));

function updateServingsAndIngredients() {
    if (!isInstanceOf(form.meal, Recipe)) {
        mealIngredients.value =
            customizeIngredients.value && !isNewMeal(form.meal) ? parseMealIngredients(form.meal) : [];

        return;
    }

    const defaultQuantity = form.servings ?? form.meal.servingsBreakdown?.quantity ?? 1;
    const multiplier =
        form.meal.servingsBreakdown?.quantity && form.servings
            ? form.servings / form.meal.servingsBreakdown.quantity
            : 1;
    form.servings = servingsOptions.value.find((option) => option === defaultQuantity) ?? servingsOptions.value[0];
    mealIngredients.value = customizeIngredients.value ? parseMealIngredients(form.meal, multiplier) : [];
}

watch(() => form.meal, updateServingsAndIngredients, { immediate: true });
watch(customizeIngredients, updateServingsAndIngredients);

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

    await logNewMeal(form.meal.name.trim());
}

function renderMeal(meal: Recipe | Meal | NewMeal) {
    if (meal instanceof Meal) {
        return meal.recipe?.name ?? '';
    }

    return meal.name;
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
    console.warn(translate('ingredients.nutritionNotFound', { name }));

    UI.toast(translate('ingredients.nutritionNotFound', { name }), {
        variant: 'warning',
    });
}

async function renderIngredients(): Promise<string[]> {
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
        await Pantry.resolveIngredient(parseIngredient(ingredient));
    }

    return renderedIngredients;
}

async function calculateRecipeNutrition(recipe: Recipe): Promise<Nutrition> {
    for (const breakdown of recipe.ingredientsBreakdown) {
        await Pantry.resolveIngredient(breakdown);
    }

    const originalServings = recipe.servingsBreakdown?.quantity;
    const ingredientsMultiplier = form.servings
        ? (form.servings === -1 ? (form.mealServings ?? 1) : form.servings) / (originalServings ?? 1)
        : 1;
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

async function logNewMeal(name: string) {
    await close();
    await UI.loading(
        {
            delay: 300,
            message: translate('logs.adding'),
        },
        async () => {
            const renderedIngredients = await renderIngredients();

            await createMeal(name, { ingredients: renderedIngredients });
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
            const ingredients = customizeIngredients.value
                ? await renderIngredients()
                : caloriesBreakdown.value?.map((ingredient) => ingredient.name);

            await createMeal(required(meal.recipe?.name), {
                servings: servings !== 1 ? formatNumber(servings) : undefined,
                ingredients,
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
            const renderedIngredients = customizeIngredients.value ? await renderIngredients() : undefined;

            await createMeal(recipe.name, {
                servings:
                    form.servings && recipe.servingsBreakdown
                        ? form.servings === -1
                            ? recipe.servingsBreakdown.renderQuantity(form.mealServings ?? 1)
                            : recipe.servingsBreakdown.renderQuantity(form.servings)
                        : form.servings !== 1
                            ? (form.servings ?? recipe.servings)?.toString()
                            : undefined,
                externalUrls: [recipe.url],
                ingredients: renderedIngredients,
            });
        },
    );
}

async function createMeal(
    name: string,
    extra: {
        servings?: string;
        externalUrls?: string[];
        ingredients?: string[];
    } = {},
) {
    const meal = new Meal({ consumedAt: form.consumedAt });
    const nutrition = {
        calories: totalCalories.value ?? 0,
        fat: caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.fat ?? 0), 0) ?? 0,
        protein: caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.protein ?? 0), 0) ?? 0,
        carbs: caloriesBreakdown.value?.reduce((total, ingredient) => total + (ingredient.carbs ?? 0), 0) ?? 0,
    };
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
