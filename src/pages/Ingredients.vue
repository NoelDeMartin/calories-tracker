<template>
    <main class="mx-auto flex w-full max-w-screen-md grow flex-col items-center pt-4">
        <Input v-model="filter" :placeholder="$t('ingredients.search')" class="w-full" />

        <Markdown
            v-if="filteredIngredients.length === 0"
            class="py-8 text-center text-gray-500"
            :lang-key="filter ? 'ingredients.noSearchResults' : 'ingredients.noIngredients'"
        />

        <div v-else class="mt-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            v-for="column in COLUMNS"
                            :key="column.field"
                            class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                            @click="sortBy(column.field)"
                        >
                            {{ column.label }}
                            <span v-if="sortField === column.field" class="ml-1">
                                {{ sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="ingredient of sortedIngredients" :key="ingredient.name" class="hover:bg-gray-50">
                        <td class="px-6 py-4 font-medium whitespace-nowrap text-gray-900">
                            {{ ingredient.name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ $t('units.calories', ingredient.nutrition?.calories ?? 0) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ $t('units.grams', ingredient.nutrition?.protein ?? 0) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ $t('units.grams', ingredient.nutrition?.carbs ?? 0) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                            {{ $t('units.grams', ingredient.nutrition?.fat ?? 0) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
</template>

<script setup lang="ts">
import { arraySorted } from '@noeldemartin/utils';
import { computed, ref } from 'vue';
import { translate } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-soukai';
import type { DeepKeyOf } from '@noeldemartin/utils';

import Ingredient from '@/models/Ingredient';

const COLUMNS: { label: string; field: DeepKeyOf<Ingredient> }[] = [
    { label: translate('ingredients.name'), field: 'name' },
    { label: translate('ingredients.calories'), field: 'nutrition.calories' },
    { label: translate('ingredients.protein'), field: 'nutrition.protein' },
    { label: translate('ingredients.carbs'), field: 'nutrition.carbs' },
    { label: translate('ingredients.fat'), field: 'nutrition.fat' },
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
