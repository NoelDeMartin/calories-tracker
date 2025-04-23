<template>
    <main class="flex grow flex-col items-center justify-center">
        <i-twemoji-balance-scale class="size-20" />
        <h1 class="text-center text-5xl font-semibold tracking-tight">
            {{ $t('home.title') }}
        </h1>
        <Markdown class="mt-4 text-center" lang-key="home.welcome" />
        <SolidLogin class="mt-2" layout="vertical" />
    </main>
</template>
