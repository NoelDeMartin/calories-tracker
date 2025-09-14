<template>
    <Modal
        :title="ingredient ? $t('ingredients.editTitle', { name: ingredient.name }) : $t('ingredients.createTitle')"
        fullscreen-mobile
    >
        <Form :form class="flex flex-1 flex-col space-y-2" @submit="submit()">
            <Input name="name" :label="$t('ingredients.formName')" />
            <Input name="imageUrl" :label="$t('ingredients.imageUrl')" />
            <TextArea name="description" :label="$t('ingredients.description')" />

            <Input name="servingInGrams" :label="$t('ingredients.formServingInGrams')" step="0.01" />
            <Input name="servingInMilliliters" :label="$t('ingredients.formServingInMilliliters')" step="0.01" />
            <Input name="calories" :label="$t('ingredients.formCalories')" step="0.01" />
            <Input name="protein" :label="$t('ingredients.protein')" step="0.01" />
            <Input name="carbs" :label="$t('ingredients.carbs')" step="0.01" />
            <Input name="fat" :label="$t('ingredients.fat')" step="0.01" />

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">{{ $t('ingredients.aliases') }}</label>
                <ul class="mt-2 space-y-2" :class="{ hidden: aliases.length === 0 }">
                    <li v-for="(_, index) in aliases" :key="index" class="flex space-x-2">
                        <Input :id="`aliases-${index}`" v-model="aliases[index]" class="flex-1" />
                        <Button variant="ghost" class="text-red-500" @click="aliases.splice(index, 1)">
                            <i-lucide-trash2 class="size-4" />
                        </Button>
                    </li>
                </ul>
                <Button variant="secondary" class="mt-2 w-full" @click="aliases.push('')">
                    {{ $t('ingredients.addAlias') }}
                </Button>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">{{ $t('ingredients.externalUrls') }}</label>
                <ul class="mt-2 space-y-2" :class="{ hidden: externalUrls.length === 0 }">
                    <li v-for="(_, index) in externalUrls" :key="index" class="flex space-x-2">
                        <Input v-model="externalUrls[index]" class="flex-1" />
                        <Button variant="ghost" class="text-red-500" @click="externalUrls.splice(index, 1)">
                            <i-lucide-trash2 class="size-4" />
                        </Button>
                    </li>
                </ul>
                <Button variant="secondary" class="mt-2 w-full" @click="externalUrls.push('')">
                    {{ $t('ingredients.addExternalUrl') }}
                </Button>
            </div>

            <div class="grow" />

            <div class="mt-4 flex justify-end space-x-2">
                <Button variant="secondary" @click="close">
                    {{ $t('ui.cancel') }}
                </Button>
                <Button submit>
                    {{ $t('ui.save') }}
                </Button>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { arrayFilter, round, validUrl } from '@noeldemartin/utils';
import { numberInput, requiredStringInput, stringInput, useForm, useModal } from '@aerogel/core';

import Ingredient from '@/models/Ingredient';

const { ingredient } = defineProps<{ ingredient?: Ingredient }>();
const { close } = useModal();

const form = useForm({
    name: requiredStringInput(ingredient?.name),
    imageUrl: stringInput(ingredient?.imageUrl),
    description: stringInput(ingredient?.description),
    servingInGrams: numberInput(ingredient?.nutrition?.servingInGrams),
    servingInMilliliters: numberInput(ingredient?.nutrition?.servingInMilliliters),
    calories: numberInput(ingredient?.nutrition?.calories),
    protein: numberInput(ingredient?.nutrition?.protein),
    carbs: numberInput(ingredient?.nutrition?.carbs),
    fat: numberInput(ingredient?.nutrition?.fat),
});

const aliases = ref<string[]>(ingredient?.aliases.slice(0) ?? []);
const externalUrls = ref<string[]>(ingredient?.externalUrls.slice(0) ?? []);

async function submit() {
    close();

    const model = ingredient ?? new Ingredient();
    const nutrition = model.nutrition ?? model.relatedNutrition.attach();

    nutrition.setAttributes({
        serving: typeof form.servingInGrams === 'number' ? `${round(form.servingInGrams, 2)} grams` : undefined,
        rawCalories: typeof form.calories === 'number' ? `${round(form.calories)} calories` : undefined,
        rawProtein: typeof form.protein === 'number' ? `${round(form.protein, 2)} grams` : undefined,
        rawCarbs: typeof form.carbs === 'number' ? `${round(form.carbs, 2)} grams` : undefined,
        rawFat: typeof form.fat === 'number' ? `${round(form.fat, 2)} grams` : undefined,
    });

    if (typeof form.servingInMilliliters === 'number') {
        const alternateServing = nutrition.alternateServings?.[0] ?? nutrition.relatedAlternateServings.attach();

        alternateServing.setAttributes({
            serving: `${round(form.servingInMilliliters, 2)} milliliters`,
        });
    } else {
        nutrition.alternateServings?.forEach((alternateServing) => {
            nutrition.relatedAlternateServings.removeRelated(alternateServing);
        });
    }

    await model.update({
        name: form.name,
        imageUrl: form.imageUrl?.trim() || null,
        description: form.description?.trim() || null,
        aliases: arrayFilter(aliases.value.map((alias) => alias.trim())),
        externalUrls: arrayFilter(externalUrls.value.map((url) => validUrl(url))),
    });
}
</script>
