<template>
    <Page>
        <DailyGoals :meals />

        <div class="mt-6 w-full space-y-4">
            <MealLog v-for="meal of meals" :key="meal.url" :meal />
        </div>

        <Button class="mt-4" @click="$ui.modal(LogMealModal)">
            <i-zondicons-add-outline class="size-4" />
            <span>{{ $t('logs.add') }}</span>
        </Button>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-soukai';

import Meal from '@/models/Meal';

import LogMealModal from './LogMealModal.vue';

const meals = useModelCollection(Meal);
</script>
