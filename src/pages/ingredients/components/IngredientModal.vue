<template>
    <Modal class="space-y-4">
        <div class="flex items-start gap-4">
            <div v-if="ingredient.imageUrl" class="flex-shrink-0">
                <SolidImage :src="ingredient.imageUrl" class="size-20 rounded-lg border border-gray-200 object-cover" />
            </div>
            <div class="flex flex-col">
                <h1 class="text-2xl font-bold text-gray-900">
                    {{ ingredient.name }}
                </h1>
                <div v-if="ingredient.aliases?.length" class="text-xs text-gray-600">
                    {{ $t('ingredients.aliases') }}: {{ ingredient.aliases.join(', ') }}
                </div>
                <div v-if="ingredient.externalUrls?.length" class="space-y-1">
                    <Link
                        v-for="url in ingredient.externalUrls"
                        :key="url"
                        :href="url"
                        class="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {{ url }}
                    </Link>
                </div>
            </div>
        </div>

        <div v-if="ingredient.description" class="rounded-lg bg-gray-50 p-4">
            <Markdown :text="ingredient.description" class="text-gray-700" />
        </div>

        <template v-if="ingredient.nutrition">
            <div class="space-y-3">
                <NutritionChart :nutrition="ingredient.nutrition" />

                <div class="overflow-hidden rounded-lg bg-gray-50">
                    <div class="border-b border-gray-200 bg-gray-100 px-4 py-2">
                        <h2 class="text-sm font-medium text-gray-900">
                            {{ $t('ingredients.nutrition') }}
                        </h2>
                    </div>
                    <div class="divide-y divide-gray-200">
                        <div
                            v-if="ingredient.nutrition.servingInGrams"
                            class="flex items-center justify-between px-4 py-2"
                        >
                            <span class="text-sm font-medium text-gray-600">
                                {{ $t('ingredients.servingGrams') }}
                            </span>
                            <span class="text-sm font-semibold text-gray-900">
                                {{ formatNumber(ingredient.nutrition.servingInGrams, 'grams') }}
                            </span>
                        </div>
                        <div
                            v-if="ingredient.nutrition.servingInMilliliters"
                            class="flex items-center justify-between px-4 py-2"
                        >
                            <span class="text-sm font-medium text-gray-600">
                                {{ $t('ingredients.servingMilliliters') }}
                            </span>
                            <span class="text-sm font-semibold text-gray-900">
                                {{ Math.round(ingredient.nutrition.servingInMilliliters * 100) / 100 }} ml
                            </span>
                        </div>
                        <div
                            v-if="
                                typeof ingredient.nutrition.calories === 'number' && ingredient.nutrition.servingInGrams
                            "
                            class="flex items-center justify-between px-4 py-2"
                        >
                            <span class="text-sm font-medium text-gray-600">
                                {{ $t('ingredients.calories') }}
                            </span>
                            <span class="text-sm font-semibold text-gray-900">
                                {{
                                    formatNumber(
                                        (ingredient.nutrition.calories * 100) / ingredient.nutrition.servingInGrams,
                                        'calories'
                                    )
                                }}
                            </span>
                        </div>
                        <div
                            v-if="typeof ingredient.nutrition.calories === 'number'"
                            class="flex items-center justify-between px-4 py-2"
                        >
                            <span class="text-sm font-medium text-gray-600">
                                {{ $t('ingredients.caloriesPerServing') }}
                            </span>
                            <span class="text-sm font-semibold text-gray-900">
                                {{ formatNumber(ingredient.nutrition.calories, 'calories') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { formatNumber } from '@/utils/formatting';
import type Ingredient from '@/models/Ingredient';

const { ingredient } = defineProps<{ ingredient: Ingredient }>();
</script>
