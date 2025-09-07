<template>
    <Page style="--breakpoint-content: 1200px">
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
                                size="icon"
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
                            <div class="flex space-x-1">
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
                                    :title="$t('ingredients.delete')"
                                    :aria-label="$t('ingredients.delete')"
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
    </Page>
</template>

<script setup lang="ts">
import Pantry from '@/services/Pantry';
import { arraySorted } from '@noeldemartin/utils';
import { computed, ref } from 'vue';
import { translate } from '@aerogel/core';
import { formatNumber } from '@/utils/formatting';
import type { DeepKeyOf } from '@noeldemartin/utils';
import type Ingredient from '@/models/Ingredient';

import IngredientFormModal from './components/IngredientFormModal.vue';

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
const filteredIngredients = computed(() => {
    if (!filter.value) {
        return Pantry.ingredients;
    }

    const query = filter.value.toLowerCase();

    return Pantry.ingredients.filter((ingredient) => ingredient.name.toLowerCase().includes(query));
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

async function deleteIngredient(ingredient: Ingredient) {
    if (!confirm(translate('ingredients.deleteConfirm', { name: ingredient.name }))) {
        return;
    }

    await ingredient.delete();
}
</script>
