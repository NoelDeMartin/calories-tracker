<template>
    <Page style="--breakpoint-content: 1200px">
        <Input v-model="filter" :placeholder="$t('ingredients.search')" class="w-full" />

        <Markdown
            v-if="filteredIngredients.length === 0"
            class="mx-auto py-8 text-center text-gray-500"
            :lang-key="filter ? 'ingredients.noSearchResults' : 'ingredients.noIngredients'"
        />

        <div v-else class="mt-4 w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
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
                <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="ingredient of sortedIngredients" :key="ingredient.name">
                        <td class="flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap text-gray-900">
                            <div
                                :class="ingredient.nutrition?.macroClass ?? 'bg-gray-400'"
                                class="h-3 w-3 rounded-full"
                            />
                            <span>{{ ingredient.name }}</span>
                            <Button
                                v-for="url of ingredient.externalUrls"
                                :key="url"
                                :href="url"
                                variant="ghost"
                                target="_blank"
                                class="opacity-75"
                            >
                                <i-lucide-external-link class="size-4" />
                            </Button>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(ingredient.nutrition?.servingGrams, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(ingredient.nutrition?.calories, { unit: 'calories', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(ingredient.nutrition?.protein, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(ingredient.nutrition?.carbs, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ formatNumber(ingredient.nutrition?.fat, { unit: 'grams', fallback: '-' }) }}
                        </td>
                        <td class="px-6 py-4 text-right whitespace-nowrap">
                            <Button variant="ghost" @click="$ui.modal(IngredientFormModal, { ingredient })">
                                <i-zondicons-edit-pencil class="size-4" />
                                <span class="sr-only">{{ $t('ingredients.edit') }}</span>
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Page>
</template>

<script setup lang="ts">
import { arraySorted } from '@noeldemartin/utils';
import { computed, ref } from 'vue';
import { translate } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-soukai';
import type { DeepKeyOf } from '@noeldemartin/utils';

import Ingredient from '@/models/Ingredient';
import IngredientFormModal from './components/IngredientFormModal.vue';
import { formatNumber } from '@/utils/formatting';

const COLUMNS: { label: string; field?: DeepKeyOf<Ingredient> }[] = [
    { label: translate('ingredients.name'), field: 'name' },
    { label: translate('ingredients.serving'), field: 'nutrition.servingGrams' },
    { label: translate('ingredients.calories'), field: 'nutrition.calories' },
    { label: translate('ingredients.protein'), field: 'nutrition.protein' },
    { label: translate('ingredients.carbs'), field: 'nutrition.carbs' },
    { label: translate('ingredients.fat'), field: 'nutrition.fat' },
    { label: '' },
];

const filter = ref('');
const sortField = ref<DeepKeyOf<Ingredient>>('name');
const sortDirection = ref<'asc' | 'desc'>('asc');
const ingredients = useModelCollection(Ingredient);
const filteredIngredients = computed(() => {
    if (!filter.value) {
        return ingredients.value;
    }

    const query = filter.value.toLowerCase();

    return ingredients.value.filter((ingredient) => ingredient.name.toLowerCase().includes(query));
});

const sortedIngredients = computed(() => arraySorted(filteredIngredients.value, sortField.value, sortDirection.value));

function sortBy(column: DeepKeyOf<Ingredient>) {
    if (sortField.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        return;
    }

    sortField.value = column;
    sortDirection.value = 'asc';
}
</script>
