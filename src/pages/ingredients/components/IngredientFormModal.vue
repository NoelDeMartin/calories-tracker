<template>
    <Modal :title="$t('ingredients.editTitle', { name: ingredient.name })">
        <Form :form class="space-y-2" @submit="submit()">
            <Input name="name" :label="$t('ingredients.editName')" />
            <Input name="serving" :label="$t('ingredients.serving')" />
            <Input name="calories" :label="$t('ingredients.calories')" step="0.01" />
            <Input name="protein" :label="$t('ingredients.protein')" step="0.01" />
            <Input name="carbs" :label="$t('ingredients.carbs')" step="0.01" />
            <Input name="fat" :label="$t('ingredients.fat')" step="0.01" />
            <div class="mt-4 flex justify-end space-x-2">
                <Button variant="secondary" @click="close">
                    {{ $t('ingredients.editCancel') }}
                </Button>
                <Button submit>
                    {{ $t('ingredients.editSubmit') }}
                </Button>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { round } from '@noeldemartin/utils';
import { UI, numberInput, requiredStringInput, translate, useForm, useModal } from '@aerogel/core';

import type Ingredient from '@/models/Ingredient';

const { ingredient } = defineProps<{ ingredient: Ingredient }>();
const { close } = useModal();

const form = useForm({
    name: requiredStringInput(ingredient.name),
    serving: numberInput(ingredient.nutrition?.servingGrams),
    calories: numberInput(ingredient.nutrition?.calories),
    protein: numberInput(ingredient.nutrition?.protein),
    carbs: numberInput(ingredient.nutrition?.carbs),
    fat: numberInput(ingredient.nutrition?.fat),
});

async function submit() {
    close();

    UI.loading(
        {
            delay: 300,
            message: translate('ingredients.editUpdating'),
        },
        async () => {
            const nutrition = ingredient.nutrition ?? ingredient.relatedNutrition.attach({});
            const servingsMultiplier = typeof form.serving === 'number' ? form.serving / 100 : 1;

            nutrition.setAttributes({
                serving: typeof form.serving === 'number' ? `${round(form.serving, 2)} grams` : undefined,
                rawCalories:
                    typeof form.calories === 'number'
                        ? `${round(form.calories * servingsMultiplier)} calories`
                        : undefined,
                rawProtein:
                    typeof form.protein === 'number'
                        ? `${round(form.protein * servingsMultiplier, 2)} grams`
                        : undefined,
                rawCarbs:
                    typeof form.carbs === 'number' ? `${round(form.carbs * servingsMultiplier, 2)} grams` : undefined,
                rawFat: typeof form.fat === 'number' ? `${round(form.fat * servingsMultiplier, 2)} grams` : undefined,
            });

            await ingredient.update({ name: form.name });
        },
    );
}
</script>
