<template>
    <Page class="items-center justify-center">
        <i-twemoji-balance-scale class="size-20" />
        <h1 class="text-center text-5xl font-semibold tracking-tight">
            {{ $t('app.title') }}
        </h1>
        <Markdown class="mt-4 text-center" lang-key="home.welcome" />
        <SolidLogin class="mt-2" />
        <span class="mt-2 text-center text-sm text-gray-500">
            {{ $t('home.orGetStarted') }}
        </span>
        <Button class="mt-2" @click="$ui.modal(LogMealModal)">
            {{ $t('logs.add') }}
        </Button>
    </Page>
</template>

<script setup lang="ts">
import LogMealModal from './LogMealModal.vue';
</script>
