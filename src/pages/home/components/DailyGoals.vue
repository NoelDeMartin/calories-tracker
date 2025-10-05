<template>
    <div v-if="$goals.calories || $goals.protein || $goals.carbs || $goals.fat" class="mt-4 w-full space-y-4">
        <DailyGoalsGoal
            v-if="$goals.calories"
            label="Calories"
            units="kcal"
            :current="totalCalories"
            :goal="$goals.calories"
            bar-filled-class="bg-calories-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-calories-500),black_40%)]"
        />
        <DailyGoalsGoal
            v-if="$goals.protein"
            min
            label="Protein"
            units="g"
            :current="totalProtein"
            :goal="$goals.protein"
            bar-filled-class="bg-protein-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-protein-500),black_40%)]"
        />
        <DailyGoalsGoal
            v-if="$goals.carbs"
            min
            label="Carbs"
            units="g"
            :current="totalCarbs"
            :goal="$goals.carbs"
            bar-filled-class="bg-carbs-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-carbs-500),black_40%)]"
        />
        <DailyGoalsGoal
            v-if="$goals.fat"
            min
            label="Fat"
            units="g"
            :current="totalFat"
            :goal="$goals.fat"
            bar-filled-class="bg-fat-500"
            bar-overflow-class="bg-[color-mix(in_srgb,var(--color-fat-500),black_40%)]"
        />
    </div>
</template>

<script setup lang="ts">
defineProps<{ totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number }>();
</script>
