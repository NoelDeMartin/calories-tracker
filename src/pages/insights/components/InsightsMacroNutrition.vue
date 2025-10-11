<template>
    <NutritionChart :nutrition class="w-full" />
</template>

<script setup lang="ts">
import NutritionInformation from '@/models/NutritionInformation';
import { computed } from 'vue';
import type { Week } from '@/pages/insights';

const { week } = defineProps<{ week: Week }>();
const nutrition = computed(
    () =>
        new NutritionInformation({
            rawCalories: `${week.totalCalories} calories`,
            rawProtein: `${week.proteinAverage} grams`,
            rawCarbs: `${week.carbsAverage} grams`,
            rawFat: `${week.fatAverage} grams`,
        }),
);
</script>
