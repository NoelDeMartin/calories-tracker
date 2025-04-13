<template>
    <div :key="meal.id" class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
            <h3 class="font-medium">
                {{ meal.recipe?.name }}
            </h3>
            <p class="text-sm text-gray-500">
                {{ meal.calories }} kcal · {{ meal.protein }}g protein · {{ meal.carbs }}g carbs · {{ meal.fat }}g fat
            </p>
            <p class="text-xs text-gray-400">
                {{ new Date().toLocaleTimeString() }}
            </p>
        </div>
        <button class="p-2 text-gray-400 transition-colors hover:text-red-500">
            <i-lucide-trash2 class="h-5 w-5" />
        </button>
    </div>
</template>

<script setup lang="ts">
import type Meal from '@/models/Meal';

defineProps<{ meal: Meal }>();
</script>
