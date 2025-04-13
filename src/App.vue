<template>
    <AppLayout class="px-4">
        <header class="mx-auto flex w-full max-w-screen-md justify-between pt-8">
            <div>
                <h1 class="text-2xl font-semibold tracking-tight">
                    {{ $t('home.title') }}
                </h1>
                <h2 v-if="$cookbook.ready" class="text-lg text-gray-500">
                    {{ $t('home.today') }}
                </h2>
            </div>
            <Account v-if="$solid.hasLoggedIn()" />
        </header>
        <main class="mx-auto flex w-full max-w-screen-md flex-grow flex-col items-center pt-4">
            <DailyLogs v-if="$cookbook.ready" />
            <RecipesMissing v-else />
        </main>
        <footer class="prose prose-sm mx-auto w-full max-w-screen-md py-4 text-center">
            <Markdown lang-key="home.footer" class="text-sm opacity-50" inline />
        </footer>
    </AppLayout>
</template>
