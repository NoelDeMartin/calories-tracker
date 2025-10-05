<template>
    <AppLayout :class="{ 'pb-mobile-footer-height': $ui.mobile }">
        <AppHeader />
        <router-view />
        <AppFooter />
    </AppLayout>
</template>
