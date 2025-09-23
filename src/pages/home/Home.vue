<template>
    <DailyLogs v-if="onboarded" />
    <Welcome v-else />
</template>

<script setup lang="ts">
import { useOnboarded } from '@/utils/app';

const onboarded = useOnboarded();
</script>
