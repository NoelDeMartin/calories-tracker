<template>
    <div class="mt-10">
        <Markdown v-if="$solid.hasLoggedIn()" lang-key="home.recipesMissing" />
        <template v-else>
            <Markdown lang-key="home.welcome" />
            <SolidLogin class="mt-3" />
        </template>
    </div>
</template>
