<template>
    <!-- @vue-generic {Recipe} -->
    <Modal v-slot="{ close }" :title="$t('logs.add')">
        <Form :form="form" class="space-y-2" @submit="close(form.recipe)">
            <Select
                name="recipe"
                :options="recipes"
                :render-option="(recipe) => recipe.name"
                :compare-options="(a, b) => a.url === b.url"
            />
            <Select name="servings" :options="servings" :render-option="renderServing" />
            <Button submit class="w-full">
                {{ $t('logs.log') }}
            </Button>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { arraySorted, arrayUnique, range, toString } from '@noeldemartin/utils';
import { computed, watchEffect } from 'vue';
import { numberInput, requiredObjectInput, useForm } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-soukai';
import type { ModalExpose } from '@aerogel/core';

import Recipe from '@/models/Recipe';

const recipes = useModelCollection(Recipe);
const form = useForm({
    recipe: requiredObjectInput(recipes.value[0]),
    servings: numberInput(),
});
const renderServing = computed(() => form.recipe.servingsBreakdown?.renderQuantity ?? toString);
const servings = computed(() => {
    const servingsBreakdown = form.recipe.servingsBreakdown;
    const defaultQuantity = servingsBreakdown?.quantity ?? 1;

    if (!servingsBreakdown) {
        return range(10);
    }

    return arraySorted(
        arrayUnique([
            ...range(10)
                .map((quantity) => quantity + 1)
                .map((quantity) => quantity * 10 ** Math.floor(Math.log10(defaultQuantity))),
            defaultQuantity,
        ]),
        (a, b) => (a > b ? 1 : -1),
    );
});

watchEffect(() => {
    if (!form.servings || servings.value.includes(form.servings)) {
        return;
    }

    form.servings = null;
});

defineExpose<ModalExpose<Recipe>>();
</script>
