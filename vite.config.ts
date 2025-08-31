import { URL, fileURLToPath } from 'node:url';

import Aerogel, { AerogelResolver } from '@aerogel/vite';
import Components from 'unplugin-vue-components/vite';
import I18n from '@intlify/unplugin-vue-i18n/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    build: { sourcemap: true },
    base: process.env.NODE_ENV === 'production' ? '/calories-tracker/' : '/',
    publicDir: fileURLToPath(new URL('./src/assets/public/', import.meta.url)),
    plugins: [
        Aerogel({
            name: 'Calories Tracker',
            description: 'Watch your calories!',
            baseUrl: 'https://noeldemartin.github.io/calories-tracker/',
            themeColor: '#fff',
            icons: {
                '192x192': 'android-chrome-192x192.png',
                '512x512': 'android-chrome-512x512.png',
            },
        }),
        Components({
            dts: 'src/types/components.d.ts',
            resolvers: [AerogelResolver(), IconsResolver()],
            dirs: ['src/components', 'src/pages'],
        }),
        I18n({ include: fileURLToPath(new URL('./src/lang/**/*.yaml', import.meta.url)) }),
        Icons({
            iconCustomizer(_, __, props) {
                props['aria-hidden'] = 'true';
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        clearMocks: true,
        setupFiles: ['./src/testing/setup.ts'],
    },
});
