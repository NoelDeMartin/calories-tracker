<template>
    <Modal :title="$t('goalsWizard.title')" fullscreen-on-mobile>
        <GoalsWizardStep1 v-if="!goalsProfile" @submit="goalsProfile = $event" />
        <GoalsWizardStep2 v-else :goals-profile @submit="$emit('close', true)" />
    </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { GoalsProfile } from '@/utils/goals';

defineEmits<{ close: [boolean] }>();

const goalsProfile = ref<GoalsProfile | null>(null);
</script>
