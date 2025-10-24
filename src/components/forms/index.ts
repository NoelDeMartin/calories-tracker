import { isNewMeal } from '@/components/meals';
import { defineFormValidationRules } from '@aerogel/core';

export const formValidationRules = defineFormValidationRules({
    'required-meal': (value) => {
        if (!isNewMeal(value) || String(value.name).trim() !== '') {
            return;
        }

        return 'required';
    },
});
