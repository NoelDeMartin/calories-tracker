<template>
    <main class="mx-auto flex w-full max-w-screen-md grow flex-col items-center justify-center gap-2 pt-4">
        <h1 class="text-2xl font-bold">
            {{ $t('notFound.title') }}
        </h1>
        <Link route="home">
            {{ $t('notFound.home') }}
        </Link>
    </main>
</template>
