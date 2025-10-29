<template>
    <Modal class="space-y-4">
        <div class="flex flex-col">
            <h1 class="text-2xl font-bold text-gray-900">
                {{ meal.recipe?.name ?? $t('logs.meal') }}
                <span v-if="meal.recipe?.servingsBreakdown?.quantity" class="text-gray-500">
                    ({{ meal.recipe?.servingsBreakdown?.quantity }})
                </span>
            </h1>
            <div v-if="meal.recipe?.externalUrls.length" class="space-y-1">
                <Link
                    v-for="url in meal.recipe.externalUrls"
                    :key="url"
                    :href="url"
                    class="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {{ url }}
                </Link>
            </div>
        </div>

        <Markdown
            v-if="meal.recipe?.description"
            class="rounded-lg bg-gray-50 p-4 text-sm"
            :text="meal.recipe.description"
        />

        <NutritionChart v-if="meal.recipe?.nutrition" :nutrition="meal.recipe.nutrition" />

        <template v-if="caloriesBreakdown?.length">
            <div class="rounded-lg bg-gray-50">
                <div class="border-b border-gray-200 bg-gray-100 px-4 py-2">
                    <h2 class="text-sm font-medium text-gray-900">
                        {{ $t('logs.mealIngredients') }}
                    </h2>
                </div>
                <div class="p-4">
                    <CaloriesBreakdown :breakdown="caloriesBreakdown" show-total />
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type Meal from '@/models/Meal';

const { meal } = defineProps<{ meal: Meal }>();
const caloriesBreakdown = computed(() => meal.getCaloriesBreakdown());
</script>
