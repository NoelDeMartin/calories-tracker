<template>
    <Setting :title="$t('settings.goals')" :description="$t('settings.goalsDescription')" layout="vertical">
        <div class="mt-4 ml-4 grid grid-cols-[auto_1fr] gap-2">
            <Input
                v-model="$goals.calories"
                type="number"
                class="col-span-2 grid grid-cols-subgrid items-center"
                :label="$t('settings.goalsCalories')"
            />
            <Input
                v-model="$goals.protein"
                type="number"
                class="col-span-2 grid grid-cols-subgrid items-center"
                :label="$t('settings.goalsProtein')"
            />
            <Input
                v-model="$goals.carbs"
                type="number"
                class="col-span-2 grid grid-cols-subgrid items-center"
                :label="$t('settings.goalsCarbs')"
            />
            <Input
                v-model="$goals.fat"
                type="number"
                class="col-span-2 grid grid-cols-subgrid items-center"
                :label="$t('settings.goalsFat')"
            />
        </div>
        <Button class="mt-4 w-full" variant="secondary" @click="openGoalsWizard()">
            {{ $t('settings.goalsWizard') }}
        </Button>
    </Setting>
</template>

<script setup lang="ts">
import GoalsWizardModal from '@/components/goals/GoalsWizardModal.vue';
import { UI } from '@aerogel/core';

async function openGoalsWizard() {
    const { response } = await UI.modal(GoalsWizardModal);

    response && (await UI.closeAllModals());
}
</script>
