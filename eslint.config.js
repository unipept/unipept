import { defineConfig } from 'eslint-define-config';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default defineConfig([
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.vue'], // Include TypeScript and Vue files
        ignores: ['node_modules', 'dist', 'build'], // Ignore common folders
        languageOptions: {
            parser: vueParser, // Use vue-eslint-parser for Vue files
            parserOptions: {
                parser: typescriptParser, // Use TypeScript parser for `<script>` blocks
                ecmaVersion: 2021,
                sourceType: 'module',
                extraFileExtensions: ['.vue'], // Support .vue files
            },
        },
        plugins: {
            vue: vuePlugin,
            '@typescript-eslint': typescriptPlugin,
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
                },
            },
        },
        rules: {
            // Vue rules
            'vue/require-default-prop': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/html-indent': ['warn', 4],
            'vue/valid-v-slot': ['error', { allowModifiers: true }],

            // TypeScript rules
            '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        files: ['**/*.js'], // Separate rules for JavaScript files
        rules: {
            '@typescript-eslint/no-unused-vars': 'off', // Disable unused var check for JS
        },
    },
]);
