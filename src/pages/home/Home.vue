<template>
    <Welcome v-if="meals.length == 0 && !$solid.hasLoggedIn()" />
    <DailyLogs v-else />
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-soukai';

import Meal from '@/models/Meal';

const meals = useModelCollection(Meal);
</script>
