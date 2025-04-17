<template>
    <main class="mx-auto flex w-full max-w-screen-md flex-grow flex-col items-center pt-4">
        <DailyGoals :meals="$meals.all" />

        <div class="mt-6 w-full space-y-4">
            <MealLog v-for="meal of $meals.all" :key="meal.url" :meal />
        </div>

        <Button class="mt-4" @click="$ui.modal(LogMealModal)">
            <i-zondicons-add-outline class="size-4" />
            <span>{{ $t('logs.add') }}</span>
        </Button>
    </main>
</template>

<script setup lang="ts">
import LogMealModal from '@/components/LogMealModal.vue';
</script>
