import { defineConfig } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['dist/**', 'public/**', 'playwright-report/**', 'test-results/**'],
    },
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
            },
        },
    },
    {
        rules: {
            // Vue rules
            'vue/require-default-prop': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/html-indent': ['warn', 4],
            'vue/valid-v-slot': ['error', { allowModifiers: true }],
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',

            // TypeScript rules
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        // src/logic is plain TypeScript: it may not depend on Vue or on the layers above it
        files: ['src/logic/**/*.ts'],
        rules: {
            'no-restricted-imports': ['error', {
                patterns: [{
                    group: [
                        'vue', 'vue-router', 'pinia', 'vuetify', 'vuetify/*', '@vueuse/*', '*.vue',
                        '@/store/*', '@/composables/*', '@/components/*', '@/router', '@/router/*', '@/plugins/*',
                        '**/store/*', '**/composables/*', '**/components/*', '**/router', '**/router/*', '**/plugins/*',
                    ],
                    message: 'src/logic may not import Vue, Pinia, Vuetify, the router, plugins, stores, composables or components.',
                }],
            }],
        },
    },
]);
