<template>
    <DailyLogs v-if="$cookbook.ready" />
    <RecipesMissing v-else-if="$solid.hasLoggedIn() && !$solid.loginOngoing" />
    <Welcome v-else />
</template>
