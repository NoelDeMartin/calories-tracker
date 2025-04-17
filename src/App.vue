<template>
    <AppLayout class="items-center px-4">
        <header
            v-if="$solid.hasLoggedIn() && !$solid.loginOngoing"
            class="mx-auto flex w-full max-w-screen-md items-center justify-between gap-2 pt-8"
        >
            <div>
                <h1 class="text-2xl font-semibold tracking-tight">
                    {{ $t('home.title') }}
                </h1>
                <h2 v-if="$cookbook.ready" class="text-lg text-gray-500">
                    {{ $t('home.today') }}
                </h2>
            </div>
            <div class="grow" />
            <ErrorLogs />
            <Account />
        </header>
        <DailyLogs v-if="$cookbook.ready" />
        <RecipesMissing v-else-if="$solid.hasLoggedIn() && !$solid.loginOngoing" />
        <Welcome v-else />
        <footer class="prose prose-sm mx-auto w-full max-w-screen-md py-4 text-center">
            <Markdown lang-key="home.footer" class="text-sm opacity-50" inline />
        </footer>
    </AppLayout>
</template>
