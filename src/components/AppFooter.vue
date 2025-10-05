<template>
    <footer
        v-if="$ui.mobile"
        class="bg-primary-200 h-mobile-footer-height fixed inset-x-0 bottom-0 flex items-center justify-center"
    >
        <AppNav />
    </footer>
    <footer v-else class="prose prose-sm mx-auto w-full max-w-screen-md py-4 text-center">
        <Markdown lang-key="app.footer" class="text-sm opacity-50" inline />
    </footer>
</template>
