<template>
    <div
        :key="meal.id"
        class="flex w-full items-center justify-between rounded-lg p-4"
        :class="meal.incomplete ? 'bg-red-50' : 'bg-gray-50'"
    >
        <div>
            <h3 v-if="meal.recipe?.name" class="font-medium">
                {{ meal.recipe.name }}
                <span v-if="meal.recipe.servings" class="text-xs text-gray-500">({{ meal.recipe.servings }})</span>
            </h3>
            <p v-if="meal.nutrition" class="text-sm text-gray-500">
                {{ formatNumber(meal.nutrition.calories, 'calories') }} ·
                {{ $t('units.protein', { protein: formatNumber(meal.nutrition.protein, 'grams') }) }} ·
                {{ $t('units.carbs', { carbs: formatNumber(meal.nutrition.carbs, 'grams') }) }} ·
                {{ $t('units.fat', { fat: formatNumber(meal.nutrition.fat, 'grams') }) }}
            </p>
            <p class="text-xs text-gray-400">
                {{ date }}
            </p>
        </div>
        <div class="flex space-x-1">
            <Button
                size="icon"
                variant="ghost"
                class="text-gray-400 transition-colors hover:text-green-500"
                @click="$ui.modal(ViewMealModal, { meal })"
            >
                <i-lucide-eye class="size-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                class="text-gray-400 transition-colors hover:text-blue-500"
                :title="$t('ingredients.edit')"
                :aria-label="$t('ingredients.edit')"
                @click="$ui.modal(EditMealModal, { meal })"
            >
                <i-zondicons-edit-pencil class="size-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                class="text-gray-400 transition-colors hover:text-red-500"
                :title="$t('logs.delete')"
                :aria-label="$t('logs.delete')"
                @click="deleteMeal()"
            >
                <i-lucide-trash2 class="size-5" />
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import ViewMealModal from './ViewMealModal.vue';
import EditMealModal from './EditMealModal.vue';
import { computed } from 'vue';
import { formatNumber } from '@/utils/formatting';
import { translate } from '@aerogel/core';
import type Meal from '@/models/Meal';

const { meal } = defineProps<{ meal: Meal }>();
const date = computed(() => (meal.consumedAt ?? meal.createdAt).toLocaleString());

async function deleteMeal() {
    if (!confirm(translate('logs.deleteConfirm', { name: meal.recipe?.name }))) {
        return;
    }

    await meal.delete();
}
</script>
