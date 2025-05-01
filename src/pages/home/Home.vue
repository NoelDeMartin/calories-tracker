<template>
    <DailyLogs v-if="recipes.length > 0" />
    <RecipesMissing v-else-if="$solid.hasLoggedIn() && !$solid.loginOngoing" />
    <Welcome v-else />
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-soukai';

import Recipe from '@/models/Recipe';

const recipes = useModelCollection(Recipe);
</script>
