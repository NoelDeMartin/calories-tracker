<template>
    <AppPage
        style="--breakpoint-content: 1400px"
        :header="`${$t('ingredients.title')} (${filteredIngredients.length})`"
    >
        <div class="flex items-center gap-2">
            <Input v-model="filter" :placeholder="$t('ingredients.search')" class="w-full" />
            <Button @click="$ui.modal(IngredientFormModal)">
                {{ $t('ingredients.add') }}
            </Button>
        </div>

        <Markdown
            v-if="filteredIngredients.length === 0"
            class="mx-auto py-8 text-center text-gray-500"
            :lang-key="filter ? 'ingredients.noSearchResults' : 'ingredients.noIngredients'"
        />

        <div v-else class="mt-4 w-full overflow-x-auto rounded-lg border border-green-200 bg-green-50">
            <table class="min-w-full divide-y divide-green-200">
                <thead class="bg-green-100">
                    <tr>
                        <th
                            v-for="column in COLUMNS"
                            :key="column.field"
                            class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                            @click="column.field && sortBy(column.field)"
                        >
                            {{ column.label }}
                            <span v-if="sortField === column.field" class="ml-1">
                                {{ sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-green-200 bg-green-50">
                    <tr
                        v-for="{
                            ingredient,
                            serving,
                            calories,
                            protein,
                            proteinDensity,
                            carbs,
                            carbsDensity,
                            fat,
                            fatDensity,
                        } of sortedIngredientsSummary"
                        :key="ingredient.name"
                    >
                        <td class="flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap text-gray-900">
                            <div
                                :class="ingredient.nutrition?.macroClass ?? 'bg-gray-400'"
                                class="h-3 w-3 rounded-full"
                            />
                            <Markdown :text="ingredient.name" inline />
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(serving, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(calories, { unit: 'calories', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(protein, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(proteinDensity, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(carbs, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(carbsDensity, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(fat, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(fatDensity, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 text-right whitespace-nowrap">
                            <div class="flex space-x-1">
                                <Button
                                    v-if="typeof ingredient.nutrition?.calories === 'undefined'"
                                    size="icon"
                                    variant="ghost"
                                    class="text-gray-400 transition-colors hover:text-orange-500"
                                    :title="$t('ingredients.updateNutrition')"
                                    :aria-label="$t('ingredients.updateNutrition')"
                                    :disabled="updatingNutrition.has(ingredient.name)"
                                    @click="updateNutrition(ingredient)"
                                >
                                    <i-lucide-refresh-ccw
                                        class="size-4"
                                        :class="{ 'animate-spin': updatingNutrition.has(ingredient.name) }"
                                    />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    class="text-gray-400 transition-colors hover:text-green-500"
                                    :title="$t('ingredients.view', { name: ingredient.name })"
                                    :aria-label="$t('ingredients.view', { name: ingredient.name })"
                                    @click="$ui.modal(IngredientModal, { ingredient })"
                                >
                                    <i-lucide-eye class="size-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    class="text-gray-400 transition-colors hover:text-blue-500"
                                    :title="$t('ingredients.edit')"
                                    :aria-label="$t('ingredients.edit')"
                                    @click="$ui.modal(IngredientFormModal, { ingredient })"
                                >
                                    <i-zondicons-edit-pencil class="size-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    class="text-gray-400 transition-colors hover:text-red-500"
                                    :title="$t('ingredients.delete', { name: ingredient.name })"
                                    :aria-label="$t('ingredients.delete', { name: ingredient.name })"
                                    @click="deleteIngredient(ingredient)"
                                >
                                    <i-lucide-trash2 class="size-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppPage>
</template>

<script setup lang="ts">
import Pantry from '@/services/Pantry';
import Nutritionix from '@/services/Nutritionix';
import { arraySorted, tap } from '@noeldemartin/utils';
import { UI, translate } from '@aerogel/core';
import { formatNumber } from '@/utils/formatting';
import { type UnwrapRef, computed, ref, shallowRef } from 'vue';
import type { DeepKeyOf } from '@noeldemartin/utils';
import type Ingredient from '@/models/Ingredient';

import IngredientFormModal from './components/IngredientFormModal.vue';
import IngredientModal from './components/IngredientModal.vue';

const COLUMNS: { label: string; field?: DeepKeyOf<UnwrapRef<typeof ingredientsSummary>[number]> }[] = [
    { label: translate('ingredients.name'), field: 'ingredient.name' },
    { label: translate('ingredients.serving'), field: 'serving' },
    { label: translate('ingredients.calories'), field: 'calories' },
    { label: translate('ingredients.protein'), field: 'protein' },
    { label: translate('ingredients.proteinDensity'), field: 'proteinDensity' },
    { label: translate('ingredients.carbs'), field: 'carbs' },
    { label: translate('ingredients.carbsDensity'), field: 'carbsDensity' },
    { label: translate('ingredients.fat'), field: 'fat' },
    { label: translate('ingredients.fatDensity'), field: 'fatDensity' },
    { label: '' },
];

const filter = ref('');
const sortField = ref<DeepKeyOf<UnwrapRef<typeof ingredientsSummary>[number]>>('ingredient.name');
const sortDirection = ref<'asc' | 'desc'>('asc');
const updatingNutrition = shallowRef(new Set<string>());
const filteredIngredients = computed(() => {
    if (!filter.value) {
        return Pantry.ingredients;
    }

    const query = filter.value.toLowerCase();

    return Pantry.ingredients.filter((ingredient) => ingredient.name.toLowerCase().includes(query));
});

const ingredientsSummary = computed(() =>
    filteredIngredients.value.map((ingredient) => {
        if (!ingredient.nutrition?.servingInGrams) {
            return { ingredient };
        }

        const multiplier = 100 / ingredient.nutrition.servingInGrams;
        const calories =
            typeof ingredient.nutrition.calories === 'number' ? ingredient.nutrition.calories * multiplier : undefined;

        return {
            ingredient,
            calories,
            serving: ingredient.nutrition.servingInGrams,
            protein:
                typeof ingredient.nutrition.protein === 'number'
                    ? ingredient.nutrition.protein * multiplier
                    : undefined,
            proteinDensity:
                typeof ingredient.nutrition.protein === 'number'
                    ? typeof calories === 'number'
                        ? calories === 0
                            ? 0
                            : (ingredient.nutrition.protein * multiplier) / (calories / 100)
                        : undefined
                    : undefined,
            carbs: typeof ingredient.nutrition.carbs === 'number' ? ingredient.nutrition.carbs * multiplier : undefined,
            carbsDensity:
                typeof ingredient.nutrition.carbs === 'number'
                    ? typeof calories === 'number'
                        ? calories === 0
                            ? 0
                            : (ingredient.nutrition.carbs * multiplier) / (calories / 100)
                        : undefined
                    : undefined,
            fat: typeof ingredient.nutrition.fat === 'number' ? ingredient.nutrition.fat * multiplier : undefined,
            fatDensity:
                typeof ingredient.nutrition.fat === 'number'
                    ? typeof calories === 'number'
                        ? calories === 0
                            ? 0
                            : (ingredient.nutrition.fat * multiplier) / (calories / 100)
                        : undefined
                    : undefined,
        };
    }));
const sortedIngredientsSummary = computed(() =>
    arraySorted(ingredientsSummary.value, sortField.value, sortDirection.value));

function sortBy(column: DeepKeyOf<UnwrapRef<typeof ingredientsSummary>[number]>) {
    if (sortField.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        return;
    }

    sortField.value = column;
    sortDirection.value = 'asc';
}

async function deleteIngredient(ingredient: Ingredient) {
    if (!confirm(translate('ingredients.deleteConfirm', { name: ingredient.name }))) {
        return;
    }

    await ingredient.delete();
}

async function updateNutrition(ingredient: Ingredient) {
    updatingNutrition.value = new Set(updatingNutrition.value).add(ingredient.name);

    try {
        const nutrition = await Nutritionix.getNutrition(ingredient.name);

        if (!nutrition) {
            UI.toast(translate('ingredients.nutritionNotFound', { name: ingredient.name }), {
                variant: 'warning',
            });

            return;
        }

        ingredient.setNutritionAttributes(nutrition);

        await ingredient.save();
    } finally {
        updatingNutrition.value = tap(new Set(updatingNutrition.value), (set) => set.delete(ingredient.name));
    }
}
</script>
