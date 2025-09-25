<template>
    <Form
        :form
        class="flex flex-1 flex-col space-y-2 overflow-y-auto"
        @submit="
            $emit('submit', {
                sex: form.sex as Sex,
                weight: form.weight,
                height: form.height,
                age: form.age,
                lifestyle: form.lifestyle as Lifestyle,
                goal: form.goal as Goal,
            })
        "
    >
        <Select
            name="sex"
            :label="$t('goalsWizard.sex')"
            :options="sexOptions"
            :render-option="(value) => $t(`goalsWizard.sexOptions.${value}`)"
        />
        <Input name="weight" step="0.1" :label="$t('goalsWizard.weight')" />
        <Input name="height" step="1" :label="$t('goalsWizard.height')" />
        <Input name="age" step="1" :label="$t('goalsWizard.age')" />
        <Select
            name="lifestyle"
            :label="$t('goalsWizard.lifestyle')"
            :options="lifestyleOptions"
            :render-option="(value) => $t(`goalsWizard.lifestyleOptions.${value}`)"
        />
        <Select
            name="goal"
            :label="$t('goalsWizard.goal')"
            :options="goalOptions"
            :render-option="(value) => $t(`goalsWizard.goalOptions.${value}`)"
        />

        <div v-if="form.goal === 'loseAndGain'" class="rounded-md bg-yellow-50 p-2 text-sm text-yellow-700">
            {{ $t('goalsWizard.loseAndGainWarning') }}
        </div>

        <div class="grow" />

        <Button submit class="w-full">
            {{ $t('goalsWizard.submitProfile') }}
        </Button>
    </Form>
</template>

<script setup lang="ts">
import { requiredNumberInput, requiredStringInput, useForm } from '@aerogel/core';
import { goalOptions, lifestyleOptions, sexOptions } from '@/utils/goals';
import type { Goal, GoalsProfile, Lifestyle, Sex } from '@/utils/goals';

defineEmits<{ submit: [GoalsProfile] }>();

const form = useForm({
    sex: requiredStringInput(),
    weight: requiredNumberInput(),
    height: requiredNumberInput(),
    age: requiredNumberInput(),
    lifestyle: requiredStringInput(),
    goal: requiredStringInput(),
});
</script>
