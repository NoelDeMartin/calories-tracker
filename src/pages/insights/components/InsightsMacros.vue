<template>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="grid grid-cols-2 gap-4 lg:col-span-2">
            <InsightsMacro
                :name="$t('insights.macrosCalories')"
                :value="week.caloriesAverage"
                :goal="$goals.calories"
                :icon="IlucideFlame"
                unit="calories"
                icon-class="text-[color-mix(in_srgb,var(--color-calories-500),black_40%)]"
                icon-background-class="bg-calories-500/30"
                bar-filled-class="bg-calories-500"
                bar-overflow-class="bg-[color-mix(in_srgb,var(--color-calories-500),black_40%)]"
            />

            <InsightsMacro
                min
                :name="$t('insights.macrosProtein')"
                :value="week.proteinAverage"
                :goal="$goals.protein"
                :icon="IlucideDumbbell"
                unit="grams"
                icon-class="text-[color-mix(in_srgb,var(--color-protein-500),black_40%)]"
                icon-background-class="bg-protein-500/30"
                bar-filled-class="bg-protein-500"
                bar-overflow-class="bg-[color-mix(in_srgb,var(--color-protein-500),black_40%)]"
            />

            <InsightsMacro
                min
                :name="$t('insights.macrosCarbs')"
                :value="week.carbsAverage"
                :goal="$goals.carbs"
                :icon="IlucideWheat"
                unit="grams"
                icon-class="text-[color-mix(in_srgb,var(--color-carbs-500),black_40%)]"
                icon-background-class="bg-carbs-500/30"
                bar-filled-class="bg-carbs-500"
                bar-overflow-class="bg-[color-mix(in_srgb,var(--color-carbs-500),black_40%)]"
            />

            <InsightsMacro
                min
                :name="$t('insights.macrosFat')"
                :value="week.fatAverage"
                :goal="$goals.fat"
                :icon="IlucideDroplet"
                unit="grams"
                icon-class="text-[color-mix(in_srgb,var(--color-fat-500),black_40%)]"
                icon-background-class="bg-fat-500/30"
                bar-filled-class="bg-fat-500"
                bar-overflow-class="bg-[color-mix(in_srgb,var(--color-fat-500),black_40%)]"
            />
        </div>

        <InsightsMacroNutrition :week />
    </div>
</template>

<script setup lang="ts">
import IlucideFlame from '~icons/lucide/flame';
import IlucideDumbbell from '~icons/lucide/dumbbell';
import IlucideWheat from '~icons/lucide/wheat';
import IlucideDroplet from '~icons/lucide/droplet';
import type { Week } from '@/pages/insights';

const { week } = defineProps<{ week: Week }>();
</script>
