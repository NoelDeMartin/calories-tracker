<template>
    <div
        :key="reactiveMeal.id"
        class="flex w-full items-center justify-between rounded-lg p-4"
        :class="reactiveMeal.incomplete ? 'bg-red-100' : 'bg-primary-100'"
    >
        <div>
            <h3 v-if="reactiveMeal.recipe?.name" class="font-medium">
                {{ reactiveMeal.recipe.name }}
                <span
                    v-if="reactiveMeal.recipe.servings"
                    class="text-xs text-gray-500"
                >({{ reactiveMeal.recipe.servings }})</span>
            </h3>
            <p v-if="reactiveMeal.nutrition" class="text-sm text-gray-500">
                {{ formatNumber(reactiveMeal.nutrition.calories, 'calories') }} ·
                {{ $t('units.protein', { protein: formatNumber(reactiveMeal.nutrition.protein, 'grams') }) }} ·
                {{ $t('units.carbs', { carbs: formatNumber(reactiveMeal.nutrition.carbs, 'grams') }) }} ·
                {{ $t('units.fat', { fat: formatNumber(reactiveMeal.nutrition.fat, 'grams') }) }}
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
                :aria-label="$t('logs.view', { name: reactiveMeal.recipe?.name })"
                :title="$t('logs.view', { name: reactiveMeal.recipe?.name })"
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
import { computedModel } from '@aerogel/plugin-soukai';
import { formatNumber } from '@/utils/formatting';
import { translate } from '@aerogel/core';
import type Meal from '@/models/Meal';

const { meal } = defineProps<{ meal: Meal }>();
const reactiveMeal = computedModel(() => meal);
const date = computed(() => (meal.consumedAt ?? meal.createdAt).toLocaleString());

async function deleteMeal() {
    if (!confirm(translate('logs.deleteConfirm', { name: meal.recipe?.name }))) {
        return;
    }

    await meal.delete();
}
</script>
