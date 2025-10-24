import { URL, fileURLToPath } from 'node:url';

import Aerogel, { AerogelResolver } from '@aerogel/vite';
import Components from 'unplugin-vue-components/vite';
import I18n from '@intlify/unplugin-vue-i18n/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    build: { sourcemap: true },
    publicDir: fileURLToPath(new URL('./src/assets/public/', import.meta.url)),
    plugins: [
        Aerogel({
            name: 'Calories Tracker',
            description: 'Watch your calories!',
            baseUrl: 'https://calories.noeldemartin.com',
            themeColor: '#fff',
            icons: [
                {
                    src: 'icons/transparent-512x512.png',
                    sizes: '512x512',
                    purpose: 'any',
                },
                {
                    src: 'icons/maskable-512x512.png',
                    sizes: '512x512',
                    purpose: 'maskable',
                },
                {
                    src: 'icons/transparent-192x192.png',
                    sizes: '192x192',
                    purpose: 'any',
                },
                {
                    src: 'icons/maskable-192x192.png',
                    sizes: '192x192',
                    purpose: 'maskable',
                },
            ],
            pwa: {
                additionalManifestEntries: [
                    { url: 'img/nav/home.png', revision: '1' },
                    { url: 'img/nav/history.png', revision: '1' },
                    { url: 'img/nav/ingredients.png', revision: '1' },
                    { url: 'img/nav/insights.png', revision: '1' },
                ],
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
