<template>
    <Form :form class="flex flex-col gap-2" @submit="submit()">
        <Markdown lang-key="goalsWizard.summary" />
        <Input
            name="calories"
            class="flex flex-col"
            :label="$t('goalsWizard.calories')"
            :description="
                tdeeDiff
                    ? $t('goalsWizard.caloriesDiff', { diff: tdeeDiff > 0 ? `+${tdeeDiff}` : tdeeDiff })
                    : undefined
            "
            :description-class="{
                'text-xs self-end': true,
                'text-green-500': tdeeDiff && tdeeDiff > 0,
                'text-red-500': tdeeDiff && tdeeDiff < 0,
            }"
        />
        <Input name="protein" :label="$t('goalsWizard.protein')" />
        <Input name="carbs" :label="$t('goalsWizard.carbs')" />
        <Input name="fat" :label="$t('goalsWizard.fat')" />
        <Details :label="$t('goalsWizard.summaryDetails')" content-class="pl-0">
            <table class="w-full border-collapse border border-gray-300 bg-white text-sm">
                <thead>
                    <tr>
                        <th class="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                            {{ $t('goalsWizard.sex') }}
                        </th>
                        <td class="border border-gray-300 px-3 py-2 text-gray-900">
                            {{ $t(`goalsWizard.sexOptions.${goalsProfile.sex}`) }}
                        </td>
                    </tr>
                    <tr>
                        <th class="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                            {{ $t('goalsWizard.weight') }}
                        </th>
                        <td class="border border-gray-300 px-3 py-2 text-gray-900">
                            {{ formatNumber(goalsProfile.weight) }}
                        </td>
                    </tr>
                    <tr>
                        <th class="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                            {{ $t('goalsWizard.height') }}
                        </th>
                        <td class="border border-gray-300 px-3 py-2 text-gray-900">
                            {{ formatNumber(goalsProfile.height) }}
                        </td>
                    </tr>
                    <tr>
                        <th class="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                            {{ $t('goalsWizard.age') }}
                        </th>
                        <td class="border border-gray-300 px-3 py-2 text-gray-900">
                            {{ goalsProfile.age }}
                        </td>
                    </tr>
                    <tr>
                        <th class="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                            {{ $t('goalsWizard.lifestyle') }}
                        </th>
                        <td class="border border-gray-300 px-3 py-2 text-gray-900">
                            {{ $t(`goalsWizard.lifestyleOptions.${goalsProfile.lifestyle}`) }}
                        </td>
                    </tr>
                    <tr>
                        <th class="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                            {{ $t('goalsWizard.goal') }}
                        </th>
                        <td class="border border-gray-300 px-3 py-2 text-gray-900">
                            {{ $t(`goalsWizard.goalOptions.${goalsProfile.goal}`) }}
                        </td>
                    </tr>
                </thead>
            </table>
        </Details>
        <Button submit class="w-full">
            {{ $t('goalsWizard.submitGoals') }}
        </Button>
    </Form>
</template>

<script setup lang="ts">
import Goals from '@/services/Goals';
import { formatNumber } from '@/utils/formatting';
import { numberInput, useForm } from '@aerogel/core';
import { computed } from 'vue';
import { type GoalsProfile, getGoalRecommendations } from '@/utils/goals';

const emit = defineEmits<{ submit: [] }>();
const { goalsProfile } = defineProps<{ goalsProfile: GoalsProfile }>();
const recommendations = getGoalRecommendations(goalsProfile);
const form = useForm({
    calories: numberInput(recommendations.calories),
    protein: numberInput(recommendations.protein),
    carbs: numberInput(),
    fat: numberInput(),
});

const tdeeDiff = computed(() => {
    if (!form.calories) {
        return;
    }

    return form.calories - recommendations.baseCalories;
});

function submit() {
    Goals.setState({
        calories: form.calories,
        protein: form.protein,
        carbs: form.carbs,
        fat: form.fat,
    });

    emit('submit');
}
</script>
